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
const treeUtils_1 = require("../util/treeUtils");
class CodeLensProvider {
    constructor(connection, forest) {
        this.handleCodeLensRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const codeLens = [];
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                tree.rootNode.children.forEach(node => {
                    if (node.type === "value_declaration") {
                        let exposed = false;
                        const declaration = treeUtils_1.TreeUtils.findFirstNamedChildOfType("function_declaration_left", node);
                        if (declaration && declaration.firstNamedChild) {
                            const functionName = declaration.firstNamedChild.text;
                            exposed = treeUtils_1.TreeUtils.isExposedFunction(tree, functionName);
                        }
                        if (node.previousNamedSibling &&
                            node.previousNamedSibling.type === "type_annotation") {
                            codeLens.push(vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.previousNamedSibling.startPosition.row, node.previousNamedSibling.startPosition.column), vscode_languageserver_1.Position.create(node.previousNamedSibling.endPosition.row, node.previousNamedSibling.endPosition.column)), exposed));
                        }
                        else {
                            codeLens.push(vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.startPosition.row, node.startPosition.column), vscode_languageserver_1.Position.create(node.endPosition.row, node.endPosition.column)), exposed));
                        }
                    }
                    else if (node.type === "type_declaration" ||
                        node.type === "type_alias_declaration") {
                        let exposed = false;
                        const typeNode = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
                        if (typeNode) {
                            exposed = treeUtils_1.TreeUtils.isExposedType(tree, typeNode.text);
                            codeLens.push(vscode_languageserver_1.CodeLens.create(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.startPosition.row, node.startPosition.column), vscode_languageserver_1.Position.create(node.endPosition.row, node.endPosition.column)), exposed));
                        }
                    }
                });
            }
            return codeLens;
        });
        this.handleCodeLensResolveRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const codelens = param;
            codelens.command = codelens.data
                ? vscode_languageserver_1.Command.create("exposed", "")
                : vscode_languageserver_1.Command.create("local", "");
            return codelens;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onCodeLens(this.handleCodeLensRequest);
        this.connection.onCodeLensResolve(this.handleCodeLensResolveRequest);
    }
}
exports.CodeLensProvider = CodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map