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
class RenameProvider {
    constructor(connection, forest) {
        this.handleRenameRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                let nodeAtPosition = tree.rootNode.namedDescendantForPosition({
                    row: param.position.line,
                    column: param.position.character,
                });
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
                    if (declaration && declaration.firstNamedChild) {
                        references.push(declaration.firstNamedChild);
                    }
                    let annotation = tree.rootNode
                        .descendantsOfType("type_annotation")
                        .find(a => a.firstNamedChild !== null &&
                        a.firstNamedChild.type === "lower_case_identifier" &&
                        a.firstNamedChild.text === nodeAtPosition.text);
                    if (annotation && annotation.firstNamedChild) {
                        references.push(annotation.firstNamedChild);
                    }
                    if (references) {
                        return {
                            changes: {
                                [param.textDocument.uri]: references.map(a => vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(a.startPosition.row, a.startPosition.column), vscode_languageserver_1.Position.create(a.endPosition.row, a.endPosition.column)), param.newName)),
                            },
                        };
                    }
                }
            }
            return undefined;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onRenameRequest(this.handleRenameRequest);
    }
}
exports.RenameProvider = RenameProvider;
//# sourceMappingURL=renameProvider.js.map