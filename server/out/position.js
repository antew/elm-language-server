"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
class Position {
    static FROM_VS_POSITION(position) {
        return new Position(position.line, position.character);
    }
    static FROM_TS_POSITION(position) {
        return new Position(position.row, position.column);
    }
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    toVSPosition() {
        return vscode_languageserver_1.Position.create(this.row, this.col);
    }
    toTSPosition() {
        return {
            column: this.col,
            row: this.row,
        };
    }
}
exports.Position = Position;
//# sourceMappingURL=position.js.map