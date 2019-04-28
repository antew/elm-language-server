import {
  Diagnostic,
  DiagnosticSeverity,
  IConnection,
  TextDocuments,
  TextDocumentChangeEvent,
  Range,
} from "vscode-languageserver";
import URI from "vscode-uri";
import { ElmAnalyseDiagnostics } from "./elmAnalyseDiagnostics";
import { ElmMakeDiagnostics } from "./elmMakeDiagnostics";

export interface IElmIssueRegion {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface IElmIssue {
  tag: string;
  overview: string;
  subregion: string;
  details: string;
  region: IElmIssueRegion;
  type: string;
  file: string;
}

export class DiagnosticsProvider {
  private documents: TextDocuments = new TextDocuments();
  private elmMakeDiagnostics: ElmMakeDiagnostics;
  private elmAnalyseDiagnostics: ElmAnalyseDiagnostics;
  private connection: IConnection;
  private elmWorkspaceFolder: URI;
  private currentDiagnostics: {
    elmMake: Map<string, Diagnostic[]>;
    elmAnalyse: Map<string, Diagnostic[]>;
  };

  constructor(connection: IConnection, elmWorkspaceFolder: URI) {
    this.getDiagnostics = this.getDiagnostics.bind(this);
    this.newElmAnalyseDiagnostics = this.newElmAnalyseDiagnostics.bind(this);
    this.elmMakeIssueToDiagnostic = this.elmMakeIssueToDiagnostic.bind(this);

    this.connection = connection;
    this.elmWorkspaceFolder = elmWorkspaceFolder;
    this.elmMakeDiagnostics = new ElmMakeDiagnostics(
      connection,
      elmWorkspaceFolder,
    );

    this.elmAnalyseDiagnostics = new ElmAnalyseDiagnostics(
      connection,
      elmWorkspaceFolder,
      this.newElmAnalyseDiagnostics,
    );

    this.currentDiagnostics = { elmMake: new Map(), elmAnalyse: new Map() };

    this.documents.listen(connection);

    this.documents.onDidOpen(this.getDiagnostics);
    this.documents.onDidChangeContent(this.getDiagnostics);
    this.documents.onDidSave(this.getDiagnostics);
  }

  private newElmAnalyseDiagnostics(diagnostics: Map<string, Diagnostic[]>) {
    this.currentDiagnostics.elmAnalyse = diagnostics;
    this.sendDiagnostics();
  }

  private sendDiagnostics() {
    this.connection.console.info(
      `before merge ${JSON.stringify(this.currentDiagnostics.elmAnalyse)}`,
    );

    const allDiagnostics: Map<string, Diagnostic[]> = new Map();
    for (let [uri, diagnostics] of this.currentDiagnostics.elmAnalyse) {
      allDiagnostics.set(uri, diagnostics);
    }
    for (let [uri, diagnostics] of this.currentDiagnostics.elmMake) {
      allDiagnostics.set(
        uri,
        (allDiagnostics.get(uri) || []).concat(diagnostics),
      );
    }

    this.connection.console.info(
      `after merge ${JSON.stringify(allDiagnostics)}`,
    );
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

  private async getDiagnostics(change: TextDocumentChangeEvent): Promise<void> {
    const compilerErrors: IElmIssue[] = [];
    const uri = URI.parse(change.document.uri);
    this.connection.console.info(
      `Parsed document uri ${uri}, original ${change.document.uri}`,
    );
    compilerErrors.push(
      ...(await this.elmMakeDiagnostics.createDiagnostics(uri)),
    );
    this.connection.console.info(
      `[elm make] got compiler errors ${JSON.stringify(compilerErrors)}`,
    );

    const text = change.document.getText();
    this.connection.console.info(
      `[elm-analyse] Updating file, text length is ${text ? text.length : 0}`,
    );
    this.elmAnalyseDiagnostics.updateFile(uri, text);

    const diagnostics: Map<string, Diagnostic[]> = compilerErrors.reduce(
      (acc, issue) => {
        // If provided path is relative, make it absolute
        if (issue.file.startsWith(".")) {
          issue.file = this.elmWorkspaceFolder + issue.file.slice(1);
        }
        const uri = URI.file(issue.file).toString();
        const arr = acc.get(uri) || [];
        arr.push(this.elmMakeIssueToDiagnostic(issue));
        acc.set(uri, arr);
        return acc;
      },
      new Map(),
    );

    this.currentDiagnostics.elmMake = diagnostics;
    this.sendDiagnostics();
  }

  private elmMakeIssueToDiagnostic(issue: IElmIssue): Diagnostic {
    const lineRange: Range = Range.create(
      issue.region.start.line === 0
        ? issue.region.start.line
        : issue.region.start.line - 1,
      issue.region.start.column === 0
        ? issue.region.start.column
        : issue.region.start.column - 1,
      issue.region.end.line === 0
        ? issue.region.end.line
        : issue.region.end.line - 1,
      issue.region.end.column === 0
        ? issue.region.end.column
        : issue.region.end.column - 1,
    );
    return Diagnostic.create(
      lineRange,
      issue.overview + " - " + issue.details.replace(/\[\d+m/g, ""),
      this.severityStringToDiagnosticSeverity(issue.type),
      undefined,
      "Elm",
    );
  }

  private severityStringToDiagnosticSeverity(
    severity: string,
  ): DiagnosticSeverity {
    switch (severity) {
      case "error":
        return DiagnosticSeverity.Error;
      case "warning":
        return DiagnosticSeverity.Warning;
      default:
        return DiagnosticSeverity.Error;
    }
  }
}
