"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_uri_1 = __importDefault(require("vscode-uri"));
const capabilityCalculator_1 = require("./capabilityCalculator");
const forest_1 = require("./forest");
const astProvider_1 = require("./providers/astProvider");
const codeLensProvider_1 = require("./providers/codeLensProvider");
const completionProvider_1 = require("./providers/completionProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const diagnosticsProvider_1 = require("./providers/diagnostics/diagnosticsProvider");
const documentSymbolProvider_1 = require("./providers/documentSymbolProvider");
const elmFormatProvider_1 = require("./providers/elmFormatProvider");
const foldingProvider_1 = require("./providers/foldingProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const referencesProvider_1 = require("./providers/referencesProvider");
const renameProvider_1 = require("./providers/renameProvider");
const workspaceSymbolProvider_1 = require("./providers/workspaceSymbolProvider");
class Server {
    constructor(connection, params) {
        this.calculator = new capabilityCalculator_1.CapabilityCalculator(params.capabilities);
        const forest = new forest_1.Forest();
        const elmWorkspaceFallback = 
        // Add a trailing slash if not present
        params.rootUri && params.rootUri.replace(/\/?$/, "/");
        const elmWorkspace = vscode_uri_1.default.parse(params.initializationOptions.elmWorkspace || elmWorkspaceFallback);
        if (elmWorkspace) {
            connection.console.info(`[elm-ls] initializing - folder=${elmWorkspace}`);
            this.registerProviders(connection, forest, elmWorkspace);
        }
        else {
            connection.console.info(`No workspace.`);
        }
    }
    get capabilities() {
        return {
            capabilities: this.calculator.capabilities,
        };
    }
    registerProviders(connection, forest, elmWorkspace) {
        // tslint:disable:no-unused-expression
        new astProvider_1.ASTProvider(connection, forest, elmWorkspace);
        new foldingProvider_1.FoldingRangeProvider(connection, forest);
        new completionProvider_1.CompletionProvider(connection, forest);
        new hoverProvider_1.HoverProvider(connection, forest);
        new diagnosticsProvider_1.DiagnosticsProvider(connection, elmWorkspace);
        new elmFormatProvider_1.ElmFormatProvider(connection, elmWorkspace);
        new definitionProvider_1.DefinitionProvider(connection, forest);
        new referencesProvider_1.ReferencesProvider(connection, forest);
        new documentSymbolProvider_1.DocumentSymbolProvider(connection, forest);
        new workspaceSymbolProvider_1.WorkspaceSymbolProvider(connection, forest);
        new codeLensProvider_1.CodeLensProvider(connection, forest);
        new renameProvider_1.RenameProvider(connection, forest);
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map