"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_diff_1 = __importDefault(require("fast-diff"));
const fs = __importStar(require("fs"));
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = __importDefault(require("vscode-uri"));
const elmUtils_1 = require("../util/elmUtils");
class ElmFormatProvider {
    constructor(connection, elmWorkspaceFolder) {
        this.handleFormattingRequest = (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const text = fs.readFileSync(vscode_uri_1.default.parse(params.textDocument.uri).fsPath);
                const options = {
                    cmdArguments: ["--stdin", "--elm-version 0.19", "--yes"],
                    notFoundText: "Install Elm-format via 'npm install -g elm-format",
                };
                const format = elmUtils_1.execCmd("elm-format", options, this.elmWorkspaceFolder, this.connection);
                format.stdin.write(text);
                format.stdin.end();
                const stdout = yield format;
                const ranges = this.getTextRangeChanges(text.toString(), stdout.stdout);
                return ranges;
            }
            catch (error) {
                error.message.includes("SYNTAX PROBLEM")
                    ? this.connection.console.error("Running elm-format failed. Check the file for syntax errors.")
                    : this.connection.window.showErrorMessage("Running elm-format failed. Install via " +
                        "'npm install -g elm-format' and make sure it's on your path");
            }
        });
        this.connection = connection;
        this.elmWorkspaceFolder = elmWorkspaceFolder;
        this.connection.onDocumentFormatting(this.handleFormattingRequest);
    }
    // Given two strings (`before`, `after`), return a list of all substrings
    // that appear in `after` but not in `before`, and the positions of each
    // of the substrings within `after`.
    getTextRangeChanges(before, after) {
        const newRanges = [];
        let lineNumber = 0;
        let column = 0;
        const parts = fast_diff_1.default(before, after);
        // Loop over every part, keeping track of:
        // 1. The current line no. and column in the `after` string
        // 2. Character ranges for all "added" parts in the `after` string
        parts.forEach(part => {
            const startLineNumber = lineNumber;
            const startColumn = column;
            if (part[0] === 0 || part[0] === -1) {
                // Split the part into lines. Loop through these lines to find
                // the line no. and column at the end of this part.
                const substring = part[1];
                const lines = substring.split("\n");
                lines.forEach((line, lineIndex) => {
                    // The first `line` is actually just a continuation of the last line
                    if (lineIndex === 0) {
                        column += line.length;
                        // All other lines come after a line break.
                    }
                    else if (lineIndex > 0) {
                        lineNumber += 1;
                        column = line.length;
                    }
                });
            }
            if (part[0] === 1) {
                newRanges.push({
                    newText: part[1],
                    range: vscode_languageserver_1.Range.create(startLineNumber, startColumn, startLineNumber, startColumn),
                });
            }
            else if (part[0] === -1) {
                newRanges.push({
                    newText: "",
                    range: vscode_languageserver_1.Range.create(startLineNumber, startColumn, lineNumber, column),
                });
            }
        });
        return newRanges;
    }
}
exports.ElmFormatProvider = ElmFormatProvider;
//# sourceMappingURL=elmFormatProvider.js.map