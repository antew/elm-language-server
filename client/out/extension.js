"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
let languageClient;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // We get activated if there is one or more elm.json file in the workspace
        // Start one server for each workspace with at least one elm.json
        // and watch Elm files in those directories.
        const elmJsons = yield vscode_1.workspace.findFiles("**/elm.json", "**/@(node_modules|elm-stuff)/**");
        elmJsons.forEach((uri) => {
            const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
            const elmJsonFolder = getElmJsonFolder(uri);
            if (workspaceFolder) {
                startClient(workspaceFolder.uri.fsPath, context, elmJsonFolder);
            }
        });
        const watcher = vscode_1.workspace.createFileSystemWatcher("**/elm.json", false, true, false);
        watcher.onDidCreate(uri => {
            const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
            const elmJsonFolder = getElmJsonFolder(uri);
            if (workspaceFolder) {
                startClient(workspaceFolder.uri.fsPath, context, elmJsonFolder);
            }
        });
        watcher.onDidDelete(uri => {
            const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
            if (workspaceFolder) {
                stopClient(workspaceFolder.uri);
            }
        });
    });
}
exports.activate = activate;
function getElmJsonFolder(uri) {
    return vscode_1.Uri.parse(uri.toString().replace("elm.json", ""));
}
function stopClient(workspaceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = clients.get(workspaceUri.fsPath);
        if (client) {
            const pattern = new vscode_1.RelativePattern(workspaceUri.fsPath, "**/elm.json");
            const files = yield vscode_1.workspace.findFiles(pattern, "**/@(node_modules|elm-stuff)/**");
            if (files.length === 0) {
                languageClient.info("Found the client shutting it down.");
                client.stop();
                clients.delete(workspaceUri.fsPath);
            }
            else {
                languageClient.info("There are still elm.json files in this workspace, not stopping the client.");
            }
        }
        else {
            languageClient.info("Could not find the client that we want to shutdown.");
        }
    });
}
const clients = new Map();
function startClient(clientWorkspace, context, elmWorkspace) {
    if (clients.has(clientWorkspace)) {
        // Client was already started for this directory
        return;
    }
    const serverModule = context.asAbsolutePath(path.join("server", "out", "index.js"));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = {
        execArgv: ["--nolazy", `--inspect=${6010 + clients.size}`],
    };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        debug: {
            module: serverModule,
            options: debugOptions,
            transport: vscode_languageclient_1.TransportKind.ipc,
        },
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
    };
    let outputChannel = vscode_1.window.createOutputChannel("elm-lsp");
    // Options to control the language client
    const clientOptions = {
        // Register the server for Elm documents in the directory
        documentSelector: [
            {
                pattern: path.join(clientWorkspace, "**", "*.elm"),
                scheme: "file",
            },
        ],
        initializationOptions: { elmWorkspace: elmWorkspace.toString() },
        // Notify the server about file changes to 'elm.json'
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher(path.join(clientWorkspace, "**/elm.json")),
        },
        diagnosticCollectionName: "elm-lsp",
        outputChannel: outputChannel,
    };
    // Create the language client and start the client.
    languageClient = new vscode_languageclient_1.LanguageClient("elmLanguageServer", "Elm Language Server", serverOptions, clientOptions);
    // Start the client. This will also launch the server
    languageClient.start();
    languageClient.info(`Starting language server for ${clientWorkspace}`);
    clients.set(clientWorkspace, languageClient);
}
function deactivate() {
    const promises = [];
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map