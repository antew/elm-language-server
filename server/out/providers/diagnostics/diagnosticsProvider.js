"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = __importDefault(require("vscode-uri"));
const elmAnalyseDiagnostics_1 = require("./elmAnalyseDiagnostics");
const elmMakeDiagnostics_1 = require("./elmMakeDiagnostics");
class DiagnosticsProvider {
    constructor(connection, elmWorkspaceFolder) {
        this.documents = new vscode_languageserver_1.TextDocuments();
        this.getDiagnostics = this.getDiagnostics.bind(this);
        this.newElmAnalyseDiagnostics = this.newElmAnalyseDiagnostics.bind(this);
        this.elmMakeIssueToDiagnostic = this.elmMakeIssueToDiagnostic.bind(this);
        this.connection = connection;
        this.elmWorkspaceFolder = elmWorkspaceFolder;
        this.elmMakeDiagnostics = new elmMakeDiagnostics_1.ElmMakeDiagnostics(connection, elmWorkspaceFolder);
        this.elmAnalyseDiagnostics = new elmAnalyseDiagnostics_1.ElmAnalyseDiagnostics(connection, elmWorkspaceFolder, this.newElmAnalyseDiagnostics);
        this.currentDiagnostics = { elmMake: new Map(), elmAnalyse: new Map() };
        this.documents.listen(connection);
        this.documents.onDidOpen(this.getDiagnostics);
        this.documents.onDidChangeContent(this.getDiagnostics);
        this.documents.onDidSave(this.getDiagnostics);
    }
    newElmAnalyseDiagnostics(diagnostics) {
        this.currentDiagnostics.elmAnalyse = diagnostics;
        this.sendDiagnostics();
    }
    sendDiagnostics() {
        this.connection.console.info(`before merge ${JSON.stringify(this.currentDiagnostics.elmAnalyse)}`);
        const allDiagnostics = new Map();
        for (let [uri, diagnostics] of this.currentDiagnostics.elmAnalyse) {
            allDiagnostics.set(uri, diagnostics);
        }
        for (let [uri, diagnostics] of this.currentDiagnostics.elmMake) {
            allDiagnostics.set(uri, (allDiagnostics.get(uri) || []).concat(diagnostics));
        }
        this.connection.console.info(`after merge ${JSON.stringify(allDiagnostics)}`);
        for (let [uri, diagnostics] of allDiagnostics) {
            this.connection.sendDiagnostics({ uri, diagnostics });
        }
        // this.currentDiagnostics.elmMake.forEach(diagnostic => {
        //   this.connection.sendDiagnostics(diagnostic);
        // });
        // this.currentDiagnostics.elmAnalyse.forEach(diagnostic => {
        //   this.connection.sendDiagnostics(diagnostic);
        // });
    }
    getDiagnostics(change) {
        return __awaiter(this, void 0, void 0, function* () {
            const compilerErrors = [];
            const uri = vscode_uri_1.default.parse(change.document.uri);
            this.connection.console.info(`Parsed document uri ${uri}, original ${change.document.uri}`);
            compilerErrors.push(...(yield this.elmMakeDiagnostics.createDiagnostics(uri)));
            this.connection.console.info(`[elm make] got compiler errors ${JSON.stringify(compilerErrors)}`);
            const text = change.document.getText();
            this.connection.console.info(`[elm-analyse] Updating file, text length is ${text ? text.length : 0}`);
            this.elmAnalyseDiagnostics.updateFile(uri, text);
            const diagnostics = compilerErrors.reduce((acc, issue) => {
                // If provided path is relative, make it absolute
                if (issue.file.startsWith(".")) {
                    issue.file = this.elmWorkspaceFolder + issue.file.slice(1);
                }
                const uri = vscode_uri_1.default.file(issue.file).toString();
                const arr = acc.get(uri) || [];
                arr.push(this.elmMakeIssueToDiagnostic(issue));
                acc.set(uri, arr);
                return acc;
            }, new Map());
            this.currentDiagnostics.elmMake = diagnostics;
            this.sendDiagnostics();
        });
    }
    elmMakeIssueToDiagnostic(issue) {
        const lineRange = vscode_languageserver_1.Range.create(issue.region.start.line === 0
            ? issue.region.start.line
            : issue.region.start.line - 1, issue.region.start.column === 0
            ? issue.region.start.column
            : issue.region.start.column - 1, issue.region.end.line === 0
            ? issue.region.end.line
            : issue.region.end.line - 1, issue.region.end.column === 0
            ? issue.region.end.column
            : issue.region.end.column - 1);
        return vscode_languageserver_1.Diagnostic.create(lineRange, issue.overview + " - " + issue.details.replace(/\[\d+m/g, ""), this.severityStringToDiagnosticSeverity(issue.type), undefined, "Elm");
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
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=diagnosticsProvider.js.map