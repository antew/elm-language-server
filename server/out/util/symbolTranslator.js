"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const treeUtils_1 = require("./treeUtils");
class SymbolInformationTranslator {
    static translateNodeToSymbolInformation(uri, node) {
        switch (node.type) {
            case "file":
                return this.createSymbolInformation("file", node, vscode_languageserver_1.SymbolKind.File, uri);
            case "value_declaration":
                return this.createSymbolInformation(node.children[0].children[0].text, node, vscode_languageserver_1.SymbolKind.Function, uri);
            case "module_declaration":
                const nameNodeModule = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_qid", node);
                if (nameNodeModule) {
                    return this.createSymbolInformation(nameNodeModule.text, node, vscode_languageserver_1.SymbolKind.Module, uri);
                }
                else {
                    return;
                }
            case "type_declaration":
                const nameNodeTypeDec = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
                if (nameNodeTypeDec) {
                    return this.createSymbolInformation(nameNodeTypeDec.text, node, vscode_languageserver_1.SymbolKind.Enum, uri);
                }
                else {
                    return;
                }
            case "type_alias_declaration":
                const nameNodeAliasDec = treeUtils_1.TreeUtils.findFirstNamedChildOfType("upper_case_identifier", node);
                if (nameNodeAliasDec) {
                    return this.createSymbolInformation(nameNodeAliasDec.text, node, vscode_languageserver_1.SymbolKind.Struct, uri);
                }
                else {
                    return;
                }
            case "union_variant":
                return this.createSymbolInformation(node.text, node, vscode_languageserver_1.SymbolKind.EnumMember, uri);
            case "number_constant_expr":
                return this.createSymbolInformation(node.text, node, vscode_languageserver_1.SymbolKind.Number, uri);
            case "string_constant_expr":
                return this.createSymbolInformation(node.text, node, vscode_languageserver_1.SymbolKind.String, uri);
            case "operator_identifier":
                return this.createSymbolInformation(node.text, node, vscode_languageserver_1.SymbolKind.Operator, uri);
            default:
                break;
        }
    }
    static createSymbolInformation(name, node, symbolKind, uri) {
        return vscode_languageserver_1.SymbolInformation.create(name, symbolKind, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(node.startPosition.row, node.startPosition.column), vscode_languageserver_1.Position.create(node.endPosition.row, node.endPosition.column)), uri);
    }
}
exports.SymbolInformationTranslator = SymbolInformationTranslator;
//# sourceMappingURL=symbolTranslator.js.map