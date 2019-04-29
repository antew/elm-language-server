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
class DocumentSymbolProvider {
    constructor(connection, forest) {
        this.handleDocumentSymbolRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const symbolInformations = [];
            const tree = this.forest.getTree(param.textDocument.uri);
            const traverse = (node) => {
                const symbolInformation = symbolTranslator_1.SymbolInformationTranslator.translateNodeToSymbolInformation(param.textDocument.uri, node);
                if (symbolInformation) {
                    symbolInformations.push(symbolInformation);
                }
                for (const childNode of node.children) {
                    traverse(childNode);
                }
            };
            if (tree) {
                traverse(tree.rootNode);
            }
            return symbolInformations;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onDocumentSymbol(this.handleDocumentSymbolRequest);
    }
}
exports.DocumentSymbolProvider = DocumentSymbolProvider;
//# sourceMappingURL=documentSymbolProvider.js.map