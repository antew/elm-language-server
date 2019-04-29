"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
class CapabilityCalculator {
    constructor(clientCapabilities) {
        this.clientCapabilities = clientCapabilities;
    }
    get capabilities() {
        // tslint:disable-next-line:no-unused-expression
        this.clientCapabilities;
        return {
            // Perform incremental syncs
            // Incremental sync is disabled for now due to not being able to get the
            // old text in ASTProvider
            // textDocumentSync: TextDocumentSyncKind.Incremental,
            codeLensProvider: {
                resolveProvider: true,
            },
            completionProvider: {
                triggerCharacters: ["."],
            },
            definitionProvider: true,
            documentFormattingProvider: true,
            documentSymbolProvider: true,
            foldingRangeProvider: true,
            hoverProvider: true,
            referencesProvider: true,
            renameProvider: true,
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Full,
            workspaceSymbolProvider: true,
        };
    }
}
exports.CapabilityCalculator = CapabilityCalculator;
//# sourceMappingURL=capabilityCalculator.js.map