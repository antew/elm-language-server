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
const vscode_languageserver_1 = require("vscode-languageserver");
class FoldingRangeProvider {
    constructor(connection, forest) {
        this.REGION_CONSTRUCTS = new Set([
            "if_else_expr",
            "case_of_expr",
            "value_declaration",
            "type_alias_declaration",
            "type_declaration",
            "record_expr",
        ]);
        this.handleFoldingRange = (param) => __awaiter(this, void 0, void 0, function* () {
            const folds = [];
            const tree = this.forest.getTree(param.textDocument.uri);
            const findLastIdenticalNamedSibling = (node) => {
                while (true) {
                    if (node.nextNamedSibling &&
                        node.nextNamedSibling.type == "import_clause") {
                        node = node.nextNamedSibling;
                    }
                    else {
                        return node;
                    }
                }
            };
            const traverse = (node) => {
                if (node.parent && node.parent.lastChild && node.isNamed) {
                    if ("import_clause" === node.type) {
                        if (node.previousNamedSibling === null ||
                            node.previousNamedSibling.type !== "import_clause") {
                            let lastNode = findLastIdenticalNamedSibling(node);
                            folds.push({
                                endCharacter: lastNode.endPosition.column,
                                endLine: lastNode.endPosition.row,
                                kind: vscode_languageserver_1.FoldingRangeKind.Imports,
                                startCharacter: node.startPosition.column,
                                startLine: node.startPosition.row,
                            });
                        }
                    }
                    else if (this.REGION_CONSTRUCTS.has(node.type)) {
                        folds.push({
                            endCharacter: node.endPosition.column,
                            endLine: node.endPosition.row,
                            kind: vscode_languageserver_1.FoldingRangeKind.Region,
                            startCharacter: node.startPosition.column,
                            startLine: node.startPosition.row,
                        });
                    }
                    else if ("block_comment" === node.type) {
                        folds.push({
                            endCharacter: node.endPosition.column,
                            endLine: node.endPosition.row,
                            kind: vscode_languageserver_1.FoldingRangeKind.Comment,
                            startCharacter: node.startPosition.column,
                            startLine: node.startPosition.row,
                        });
                    }
                }
                for (const childNode of node.children) {
                    traverse(childNode);
                }
            };
            if (tree) {
                traverse(tree.rootNode);
            }
            return folds;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onRequest(vscode_languageserver_1.FoldingRangeRequest.type, this.handleFoldingRange);
    }
}
exports.FoldingRangeProvider = FoldingRangeProvider;
//# sourceMappingURL=foldingProvider.js.map