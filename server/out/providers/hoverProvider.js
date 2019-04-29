"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const hintHelper_1 = require("../util/hintHelper");
class HoverProvider {
    constructor(connection, forest) {
        this.handleHoverRequest = (param) => {
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                const nodeAtPosition = tree.rootNode.namedDescendantForPosition({
                    column: param.position.character,
                    row: param.position.line,
                });
                const declaration = tree.rootNode
                    .descendantsOfType("value_declaration")
                    .find(a => a.firstNamedChild !== null &&
                    a.firstNamedChild.type === "function_declaration_left" &&
                    a.firstNamedChild.firstNamedChild !== null &&
                    a.firstNamedChild.firstNamedChild.type ===
                        "lower_case_identifier" &&
                    a.firstNamedChild.firstNamedChild.text === nodeAtPosition.text);
                const value = hintHelper_1.HintHelper.createHintFromValueDeclaration(declaration);
                if (value) {
                    return {
                        contents: {
                            kind: vscode_languageserver_1.MarkupKind.Markdown,
                            value,
                        },
                    };
                }
            }
            return undefined;
        };
        this.connection = connection;
        this.forest = forest;
        this.connection.onHover(this.handleHoverRequest);
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hoverProvider.js.map