"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const hintHelper_1 = require("../util/hintHelper");
const treeUtils_1 = require("../util/treeUtils");
class CompletionProvider {
    constructor(connection, forest) {
        this.handleCompletionRequest = (param) => {
            const completions = [];
            const tree = this.forest.getTree(param.textDocument.uri);
            if (tree) {
                const functions = treeUtils_1.TreeUtils.findAllNamedChildsOfType("value_declaration", tree.rootNode);
                // Add functions
                if (functions) {
                    const declarations = functions.filter(a => a.firstNamedChild !== null &&
                        a.firstNamedChild.type === "function_declaration_left" &&
                        a.firstNamedChild.firstNamedChild !== null &&
                        a.firstNamedChild.firstNamedChild.type === "lower_case_identifier");
                    for (const declaration of declarations) {
                        const value = hintHelper_1.HintHelper.createHintFromValueDeclaration(declaration);
                        if (value !== undefined) {
                            completions.push({
                                documentation: {
                                    kind: vscode_languageserver_1.MarkupKind.Markdown,
                                    value,
                                },
                                kind: vscode_languageserver_1.SymbolKind.Function,
                                label: declaration.firstNamedChild.firstNamedChild.text,
                            });
                        }
                    }
                }
                // Add types
                const typeDeclarations = tree.rootNode.descendantsOfType("type_declaration");
                for (const declaration of typeDeclarations) {
                    const value = hintHelper_1.HintHelper.createHintFromValueDeclaration(declaration);
                    const name = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration);
                    if (value !== undefined && name) {
                        completions.push({
                            documentation: {
                                kind: vscode_languageserver_1.MarkupKind.Markdown,
                                value,
                            },
                            kind: vscode_languageserver_1.SymbolKind.Enum,
                            label: name.text,
                        });
                    }
                }
                // Add types constucturs
                const unionVariants = tree.rootNode.descendantsOfType("union_variant");
                for (const declaration of unionVariants) {
                    const name = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration);
                    if (name) {
                        completions.push({
                            kind: vscode_languageserver_1.SymbolKind.Enum,
                            label: name.text,
                        });
                    }
                }
                // Add alias types
                const typeAliasDeclarations = tree.rootNode.descendantsOfType("type_alias_declaration");
                for (const declaration of typeAliasDeclarations) {
                    const value = hintHelper_1.HintHelper.createHintFromValueDeclaration(declaration);
                    const name = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", declaration);
                    if (value !== undefined && name) {
                        completions.push({
                            documentation: {
                                kind: vscode_languageserver_1.MarkupKind.Markdown,
                                value,
                            },
                            kind: vscode_languageserver_1.SymbolKind.Struct,
                            label: name.text,
                        });
                    }
                }
            }
            return completions;
        };
        this.connection = connection;
        this.forest = forest;
        this.connection.onCompletion(this.handleCompletionRequest);
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map