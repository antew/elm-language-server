"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
const fs = __importStar(require("fs"));
const util_1 = __importDefault(require("util"));
const readFile = util_1.default.promisify(fs.readFile);
class ElmAnalyseDiagnostics {
    constructor(connection, elmWorkspace, onNewDiagnostics) {
        this.filesWithDiagnostics = new Set();
        this.updateFile = (uri, text) => {
            this.elmAnalyse.then(elmAnalyse => {
                this.connection.console.info(`[elm-analyse] updating file ${uri}`);
                elmAnalyse.ports.fileWatch.send({
                    content: text || null,
                    event: "update",
                    file: path.relative(this.elmWorkspace.fsPath, uri.path),
                });
            });
        };
        this.onNewReport = (report) => {
            this.connection.console.info(`Got new elm-analyse report!`);
            // When publishing diagnostics it looks like you have to publish
            // for one URI at a time, so this groups all of the messages for
            // each file and sends them as a batch
            const diagnostics = report.messages.reduce((acc, message) => {
                const uri = this.elmWorkspace + message.file;
                const arr = acc.get(uri) || [];
                arr.push(messageToDiagnostic(message));
                acc.set(uri, arr);
                return acc;
            }, new Map());
            const filesInReport = new Set(diagnostics.keys());
            const filesThatAreNowFixed = new Set([...this.filesWithDiagnostics].filter(uriPath => !filesInReport.has(uriPath)));
            this.filesWithDiagnostics = filesInReport;
            // We you fix the last error in a file it no longer shows up in the report, but
            // we still need to clear the error marker for it
            filesThatAreNowFixed.forEach(file => diagnostics.set(file, []));
            this.onNewDiagnostics(diagnostics);
        };
        this.connection = connection;
        this.elmWorkspace = elmWorkspace;
        this.onNewDiagnostics = onNewDiagnostics;
        this.elmAnalyse = this.setupElmAnalyse();
    }
    setupElmAnalyse() {
        return __awaiter(this, void 0, void 0, function* () {
            const fsPath = this.elmWorkspace.fsPath;
            const elmJson = yield readFile(path.join(fsPath, "elm.json"), {
                encoding: "utf-8",
            });
            const fileLoadingPorts = require("elm-analyse/dist/app/file-loading-ports.js");
            const { Elm } = require("elm-analyse/dist/app/backend-elm.js");
            const elmAnalyse = Elm.Analyser.init({
                flags: {
                    project: elmJson,
                    registry: [],
                    server: false,
                },
            });
            fileLoadingPorts.setup(elmAnalyse, {}, this.elmWorkspace.fsPath);
            elmAnalyse.ports.sendReportValue.subscribe(this.onNewReport);
            return elmAnalyse;
        });
    }
}
exports.ElmAnalyseDiagnostics = ElmAnalyseDiagnostics;
function messageToDiagnostic(message) {
    if (message.type === "FileLoadFailed") {
        return {
            code: "1",
            message: "Error parsing file",
            range: {
                start: { line: 0, character: 0 },
                end: { line: 1, character: 0 },
            },
            severity: vscode_languageserver_1.DiagnosticSeverity.Error,
            source: "elm-analyse",
        };
    }
    const [lineStart, colStart, lineEnd, colEnd] = message.data.properties.range;
    const range = {
        start: { line: lineStart - 1, character: colStart - 1 },
        end: { line: lineEnd - 1, character: colEnd - 1 },
    };
    return {
        code: message.id,
        // Clean up the error message a bit, removing the end of the line, e.g.
        // "Record has only one field. Use the field's type or introduce a Type. At ((14,5),(14,20))"
        message: message.data.description.split(/at .+$/i)[0] +
            "\n" +
            `See https://stil4m.github.io/elm-analyse/#/messages/${message.type}`,
        range,
        severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
        source: "elm-analyse",
    };
}
//# sourceMappingURL=elmAnalyseDiagnostics.js.map