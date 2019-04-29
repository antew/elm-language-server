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
class DefinitionProvider {
    constructor(connection, forest) {
        this.handleDefinitionRequest = (param) => __awaiter(this, void 0, void 0, function* () {
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                let node = tree.rootNode.namedDescendantForPosition({
                    row: param.position.line,
                    column: param.position.character,
                });
                let declaration = tree.rootNode
                    .descendantsOfType("function_declaration_left")
                    .find(a => a.firstNamedChild !== null &&
                    a.firstNamedChild.type === "lower_case_identifier" &&
                    a.firstNamedChild.text === node.text);
                if (declaration) {
                    return vscode_languageserver_1.Location.create(param.textDocument.uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(declaration.startPosition.row, declaration.startPosition.column), vscode_languageserver_1.Position.create(declaration.endPosition.row, declaration.endPosition.column)));
                }
            }
            return undefined;
        });
        this.connection = connection;
        this.forest = forest;
        this.connection.onDefinition(this.handleDefinitionRequest);
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map