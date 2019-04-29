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
class ReferencesProvider {
    constructor(connection, forest) {
        this.handleReferencesRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                let nodeAtPosition = tree.rootNode.namedDescendantForPosition({
                    row: param.position.line,
                    column: param.position.character,
                });
                // let nameNode: SyntaxNode | null = null;
                // if (nodeAtPosition.type === "function_call_expr") {
                //   nameNode = nodeAtPosition.firstNamedChild;
                // } else if (nodeAtPosition.type === "lower_case_identifier") {
                //   nameNode = nodeAtPosition;
                // }
                if (nodeAtPosition) {
                    let references = tree.rootNode
                        .descendantsOfType("value_expr")
                        .filter(a => a.firstNamedChild !== null &&
                        a.firstNamedChild.type === "value_qid" &&
                        a.firstNamedChild.lastNamedChild !== null &&
                        a.firstNamedChild.lastNamedChild.text === nodeAtPosition.text);
                    let declaration = tree.rootNode
                        .descendantsOfType("function_declaration_left")
                        .find(a => a.firstNamedChild !== null &&
                        a.firstNamedChild.type === "lower_case_identifier" &&
                        a.firstNamedChild.text === nodeAtPosition.text);
                    if (declaration) {
                        references.push(declaration);
                    }
                    if (references) {
                        return references.map(a => vscode_languageserver_1.Location.create(param.textDocument.uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(a.startPosition.row, a.startPosition.column), vscode_languageserver_1.Position.create(a.endPosition.row, a.endPosition.column))));
                    }
                }
            }
            return undefined;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onReferences(this.handleReferencesRequest);
    }
}
exports.ReferencesProvider = ReferencesProvider;
//# sourceMappingURL=referencesProvider.js.map