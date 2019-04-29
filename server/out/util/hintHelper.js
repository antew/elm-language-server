"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HintHelper {
    static createHintFromValueDeclaration(declaration) {
        if (declaration) {
            let comment = "";
            let annotation = "";
            if (declaration.previousNamedSibling) {
                if (declaration.previousNamedSibling.type === "type_annotation") {
                    annotation = declaration.previousNamedSibling.text;
                    if (declaration.previousNamedSibling.previousNamedSibling &&
                        declaration.previousNamedSibling.previousNamedSibling.type ===
                            "block_comment") {
                        comment =
                            declaration.previousNamedSibling.previousNamedSibling.text;
                    }
                }
                else if (declaration.previousNamedSibling.type === "block_comment") {
                    comment = declaration.previousNamedSibling.text;
                }
            }
            return this.createHint(annotation, comment);
        }
    }
    static createHint(annotation, comment) {
        let value = "";
        if (annotation) {
            value += this.wrapCodeInMarkdown(annotation);
        }
        if (comment) {
            if (value.length > 0) {
                value += "\n\n---\n\n";
            }
            value += this.stripComment(comment);
        }
        return value;
    }
    static stripComment(comment) {
        let newComment = comment;
        if (newComment.startsWith("{-|")) {
            newComment = newComment.slice(3);
        }
        if (newComment.startsWith("{-")) {
            newComment = newComment.slice(2);
        }
        if (newComment.endsWith("-}")) {
            newComment = newComment.slice(0, -2);
        }
        return newComment.trim();
    }
    static wrapCodeInMarkdown(code) {
        return `\n\`\`\`elm\n${code}\n\`\`\`\n`;
    }
}
exports.HintHelper = HintHelper;
//# sourceMappingURL=hintHelper.js.map