"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolTable = void 0;
class SymbolTable {
    constructor() {
        this.symbols = new Map(); // symbol ID -> Entry
        this.fqnToSymbolId = new Map(); // FQN -> symbol ID
        this.scopes = new Map(); // scopeId -> symbol IDs
    }
    define(sym, scopeId, visibility = 'public') {
        const existingId = this.fqnToSymbolId.get(sym.fqn);
        const entry = {
            symbol: sym,
            scopeId,
            visibility,
            shadowsSymbolId: existingId
        };
        this.symbols.set(sym.id, entry);
        this.fqnToSymbolId.set(sym.fqn, sym.id);
        if (!this.scopes.has(scopeId)) {
            this.scopes.set(scopeId, []);
        }
        this.scopes.get(scopeId).push(sym.id);
    }
    lookupById(id) {
        return this.symbols.get(id);
    }
    lookupByFqn(fqn) {
        const id = this.fqnToSymbolId.get(fqn);
        return id ? this.symbols.get(id) : undefined;
    }
    getSymbolsInScope(scopeId) {
        const ids = this.scopes.get(scopeId) || [];
        return ids.map(id => this.symbols.get(id)).filter(Boolean);
    }
    getAllEntries() {
        return Array.from(this.symbols.values());
    }
    clear() {
        this.symbols.clear();
        this.fqnToSymbolId.clear();
        this.scopes.clear();
    }
}
exports.SymbolTable = SymbolTable;
//# sourceMappingURL=symbol-table.js.map