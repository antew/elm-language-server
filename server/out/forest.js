"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treeUtils_1 = require("./util/treeUtils");
class Forest {
    constructor() {
        this.treeIndex = [];
        this.treeIndex = new Array();
    }
    getTree(uri) {
        const result = this.treeIndex.find(tree => tree.uri === uri);
        if (result) {
            return result.tree;
        }
        else {
            return undefined;
        }
    }
    getTreeByModuleName(moduleName) {
        const result = this.treeIndex.find(tree => tree.moduleName === moduleName);
        if (result) {
            return result.tree;
        }
        else {
            return undefined;
        }
    }
    setTree(uri, writeable, referenced, tree) {
        const moduleResult = treeUtils_1.TreeUtils.getModuleName(tree);
        if (moduleResult) {
            const { moduleName, exposing } = moduleResult;
            const existingTree = this.treeIndex.findIndex(a => a.uri === uri);
            if (existingTree !== -1) {
                this.treeIndex[existingTree] = {
                    exposing,
                    moduleName,
                    referenced,
                    tree,
                    uri,
                    writeable,
                };
            }
            else {
                this.treeIndex.push({
                    exposing,
                    moduleName,
                    referenced,
                    tree,
                    uri,
                    writeable,
                });
            }
        }
    }
    removeTree(uri) {
        // Not sure this is the best way to do this...
        this.treeIndex = this.treeIndex.filter(tree => tree.uri !== uri);
    }
}
exports.Forest = Forest;
//# sourceMappingURL=forest.js.map