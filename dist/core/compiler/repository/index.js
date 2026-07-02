"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryIndex = void 0;
class RepositoryIndex {
    constructor() {
        this.symbols = new Map(); // FQN -> Symbol
        this.edges = [];
        this.filePaths = new Set();
    }
    addSymbol(sym) {
        this.symbols.set(sym.fqn, sym);
        if (sym.span?.file) {
            this.filePaths.add(sym.span.file);
        }
    }
    getSymbol(fqn) {
        return this.symbols.get(fqn);
    }
    getMetrics() {
        const symbolCount = this.symbols.size;
        const moduleCount = Array.from(this.symbols.values()).filter(s => s.symbolKind === 'Module').length;
        const importCount = Array.from(this.symbols.values()).filter(s => s.symbolKind === 'Variable' && s.metadata.isImport).length;
        const referenceCount = this.edges.length;
        return {
            symbolCount,
            moduleCount,
            importCount,
            referenceCount
        };
    }
    diff(other) {
        const added = [];
        const deleted = [];
        const modified = [];
        // Compare this index (new) against other index (old/parent)
        for (const [fqn, sym] of this.symbols.entries()) {
            const oldSym = other.getSymbol(fqn);
            if (!oldSym) {
                added.push(fqn);
            }
            else if (sym.id !== oldSym.id) {
                modified.push(fqn);
            }
        }
        for (const fqn of other.symbols.keys()) {
            if (!this.symbols.has(fqn)) {
                deleted.push(fqn);
            }
        }
        return { added, deleted, modified };
    }
}
exports.RepositoryIndex = RepositoryIndex;
//# sourceMappingURL=index.js.map