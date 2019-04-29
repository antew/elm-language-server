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
Object.defineProperty(exports, "__esModule", { value: true });
const cp = __importStar(require("child_process"));
const readline = __importStar(require("readline"));
const vscode_languageserver_1 = require("vscode-languageserver");
const utils = __importStar(require("../../util/elmUtils"));
class ElmMakeDiagnostics {
    constructor(connection, elmWorkspaceFolder) {
        this.createDiagnostics = (filePath) => __awaiter(this, void 0, void 0, function* () {
            return yield this.checkForErrors(this.connection, this.elmWorkspaceFolder.fsPath, filePath.fsPath);
        });
        this.connection = connection;
        this.elmWorkspaceFolder = elmWorkspaceFolder;
    }
    checkForErrors(connection, rootPath, filename) {
        return new Promise((resolve, reject) => {
            const makeCommand = "elm";
            const cwd = rootPath;
            let make;
            if (utils.isWindows) {
                filename = '"' + filename + '"';
            }
            const args = [
                "make",
                filename,
                "--report",
                "json",
                "--output",
                "/dev/null",
            ];
            if (utils.isWindows) {
                make = cp.exec(makeCommand + " " + args.join(" "), { cwd });
            }
            else {
                make = cp.spawn(makeCommand, args, { cwd });
            }
            if (!make.stderr) {
                return;
            }
            const errorLinesFromElmMake = readline.createInterface({
                input: make.stderr,
            });
            const lines = [];
            errorLinesFromElmMake.on("line", (line) => {
                const errorObject = JSON.parse(line);
                if (errorObject.type === "compile-errors") {
                    errorObject.errors.forEach((error) => {
                        const problems = error.problems.map((problem) => ({
                            details: problem.message
                                .map((message) => typeof message === "string"
                                ? message
                                : "#" + message.string + "#")
                                .join(""),
                            file: error.path,
                            overview: problem.title,
                            region: problem.region,
                            subregion: "",
                            tag: "error",
                            type: "error",
                        }));
                        lines.push(...problems);
                    });
                }
                else if (errorObject.type === "error") {
                    const problem = {
                        details: errorObject.message
                            .map((message) => typeof message === "string" ? message : message.string)
                            .join(""),
                        file: errorObject.path,
                        overview: errorObject.title,
                        region: {
                            end: {
                                column: 1,
                                line: 1,
                            },
                            start: {
                                column: 1,
                                line: 1,
                            },
                        },
                        subregion: "",
                        tag: "error",
                        type: "error",
                    };
                    lines.push(problem);
                }
            });
            make.on("error", (err) => {
                errorLinesFromElmMake.close();
                if (err && err.code === "ENOENT") {
                    connection.window.showErrorMessage("The 'elm make' compiler is not available. Install Elm via 'npm install -g elm'.");
                    resolve([]);
                }
                else {
                    reject(err);
                }
            });
            make.on("close", (code, signal) => {
                errorLinesFromElmMake.close();
                resolve(lines);
            });
        });
    }
    severityStringToDiagnosticSeverity(severity) {
        switch (severity) {
            case "error":
                return vscode_languageserver_1.DiagnosticSeverity.Error;
            case "warning":
                return vscode_languageserver_1.DiagnosticSeverity.Warning;
            default:
                return vscode_languageserver_1.DiagnosticSeverity.Error;
        }
    }
    elmMakeIssueToDiagnostic(issue) {
        const lineRange = vscode_languageserver_1.Range.create(issue.region.start.line - 1, issue.region.start.column - 1, issue.region.end.line - 1, issue.region.end.column - 1);
        return vscode_languageserver_1.Diagnostic.create(lineRange, issue.overview + " - " + issue.details.replace(/\[\d+m/g, ""), this.severityStringToDiagnosticSeverity(issue.type), undefined, "Elm");
    }
}
exports.ElmMakeDiagnostics = ElmMakeDiagnostics;
//# sourceMappingURL=elmMakeDiagnostics.js.map