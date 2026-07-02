"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolService = void 0;
class SymbolService {
    constructor(index) {
        this.index = index;
    }
    getSymbol(fqn) {
        return this.index.getSymbol(fqn);
    }
    getSymbolsByFile(filePath) {
        return Array.from(this.index.symbols.values()).filter(s => s.span?.file === filePath);
    }
    searchPrefix(prefix) {
        return Array.from(this.index.symbols.values()).filter(s => s.fqn.startsWith(prefix));
    }
}
exports.SymbolService = SymbolService;
//# sourceMappingURL=symbol.js.map