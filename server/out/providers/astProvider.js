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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const util_1 = __importDefault(require("util"));
// Convert fs.readFile into Promise version of same
const readFile = util_1.default.promisify(fs_1.default.readFile);
const globPromise = util_1.default.promisify(glob_1.default);
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_elm_1 = __importDefault(require("tree-sitter-elm"));
const vscode_uri_1 = __importDefault(require("vscode-uri"));
const position_1 = require("../position");
class ASTProvider {
    constructor(connection, forest, elmWorkspace) {
        this.initializeWorkspace = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const path = this.elmWorkspace.fsPath + "elm.json";
                this.connection.console.info("Reading elm.json from " + path); // output 'testing'
                // Find elm files and feed them to tree sitter
                const elmJson = require(path);
                const sourceDirs = elmJson["source-directories"];
                const elmFolders = [];
                sourceDirs.forEach((folder) => __awaiter(this, void 0, void 0, function* () {
                    elmFolders.push(this.elmWorkspace.fsPath + folder);
                }));
                this.connection.console.info("source-dirs found: " + elmFolders.toString()); // output 'testing'
                const elmFilePaths = yield this.findElmFilesInFolders(elmFolders);
                this.connection.console.info("Found " +
                    elmFilePaths.length.toString() +
                    " files to add to the project");
                for (const filePath of elmFilePaths) {
                    const fileContent = yield readFile(filePath.toString(), "utf8");
                    let tree;
                    tree = this.parser.parse(fileContent);
                    this.forest.setTree(vscode_uri_1.default.file(filePath).toString(), true, true, tree);
                }
            }
            catch (error) {
                this.connection.console.info(error.toString());
            }
        });
        this.handleChangeTextDocument = (params) => __awaiter(this, void 0, void 0, function* () {
            this.connection.console.info("Changed text document, going to parse it");
            const document = params.textDocument;
            let tree = this.forest.getTree(document.uri);
            if (tree === undefined) {
                return;
            }
            for (const changeEvent of params.contentChanges) {
                if (changeEvent.range && changeEvent.rangeLength) {
                    // range is range of the change. end is exclusive
                    // rangeLength is length of text removed
                    // text is new text
                    const { range, rangeLength, text } = changeEvent;
                    const startIndex = range.start.line * range.start.character;
                    const oldEndIndex = startIndex + rangeLength - 1;
                    if (tree) {
                        tree.edit({
                            // end index for new version of text
                            newEndIndex: range.end.line * range.end.character - 1,
                            // position in new doc change ended
                            newEndPosition: position_1.Position.FROM_VS_POSITION(range.end).toTSPosition(),
                            // end index for old version of text
                            oldEndIndex,
                            // position in old doc change ended.
                            oldEndPosition: this.computeEndPosition(startIndex, oldEndIndex, tree),
                            // index in old doc the change started
                            startIndex,
                            // position in old doc change started
                            startPosition: position_1.Position.FROM_VS_POSITION(range.start).toTSPosition(),
                        });
                    }
                    tree = this.parser.parse(text, tree);
                }
                else {
                    tree = this.buildTree(changeEvent.text);
                }
            }
            if (tree) {
                this.forest.setTree(document.uri, true, true, tree);
            }
        });
        this.handleCloseTextDocument = (params) => __awaiter(this, void 0, void 0, function* () {
            const document = params.textDocument;
            this.forest.removeTree(document.uri);
        });
        this.buildTree = (text) => {
            return this.parser.parse(text);
        };
        this.computeEndPosition = (startIndex, endIndex, tree) => {
            const node = tree.rootNode.descendantForIndex(startIndex, endIndex);
            return node.endPosition;
        };
        this.connection = connection;
        this.forest = forest;
        this.elmWorkspace = elmWorkspace;
        this.parser = new tree_sitter_1.default();
        try {
            this.parser.setLanguage(tree_sitter_elm_1.default);
        }
        catch (error) {
            this.connection.console.info(error.toString());
        }
        this.connection.onDidChangeTextDocument(this.handleChangeTextDocument);
        this.connection.onDidCloseTextDocument(this.handleCloseTextDocument);
        this.initializeWorkspace();
    }
    findElmFilesInFolders(elmFolders) {
        return __awaiter(this, void 0, void 0, function* () {
            let elmFilePaths = [];
            for (const element of elmFolders) {
                elmFilePaths = elmFilePaths.concat(yield this.findElmFilesInFolder(element));
            }
            return elmFilePaths;
        });
    }
    findElmFilesInFolder(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield globPromise(path + "/**/*.elm", {});
        });
    }
}
exports.ASTProvider = ASTProvider;
//# sourceMappingURL=astProvider.js.map