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
const symbolTranslator_1 = require("../util/symbolTranslator");
class WorkspaceSymbolProvider {
    constructor(connection, forest) {
        this.workspaceSymbolRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const symbolInformations = [];
            this.forest.treeIndex.forEach(tree => {
                const traverse = (node) => {
                    const symbolInformation = symbolTranslator_1.SymbolInformationTranslator.translateNodeToSymbolInformation(tree.uri, node);
                    if (symbolInformation) {
                        symbolInformations.push(symbolInformation);
                    }
                    for (const childNode of node.children) {
                        traverse(childNode);
                    }
                };
                if (tree) {
                    traverse(tree.tree.rootNode);
                }
            });
            return symbolInformations;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onWorkspaceSymbol(this.workspaceSymbolRequest);
    }
}
exports.WorkspaceSymbolProvider = WorkspaceSymbolProvider;
//# sourceMappingURL=workspaceSymbolProvider.js.map