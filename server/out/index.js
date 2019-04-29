#!/usr/bin/env node
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
const vscode_languageserver_1 = require("vscode-languageserver");
const rebuilder_1 = require("./util/rebuilder");
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
connection.onInitialize((params) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            connection.console.info("Rebuilding tree-sitter for local Electron version");
            const runtime = params.initializationOptions.runtime || "electron";
            const rebuildResult = yield rebuilder_1.rebuildTreeSitter(connection.console, runtime);
            for (const result of rebuildResult) {
                if (result) {
                    connection.console.error("Rebuild failed!");
                    connection.console.error(result.toString());
                    reject();
                }
            }
            connection.console.info("Rebuild succeeded!");
            const { Server } = yield Promise.resolve().then(() => __importStar(require("./server")));
            const server = new Server(connection, params);
            resolve(server.capabilities);
        }
        catch (error) {
            reject();
        }
    }));
}));
// Listen on the connection
connection.listen();
//# sourceMappingURL=index.js.map