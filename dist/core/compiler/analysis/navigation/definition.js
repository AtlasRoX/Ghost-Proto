"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionResolver = void 0;
class DefinitionResolver {
    constructor(repo) {
        this.repo = repo;
    }
    findDefinition(sym) {
        if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
            const targetId = sym.metadata.targetSymbolId;
            if (targetId) {
                const target = Array.from(this.repo.index.symbols.values()).find(s => s.id === targetId);
                return target || null;
            }
        }
        return sym;
    }
}
exports.DefinitionResolver = DefinitionResolver;
//# sourceMappingURL=definition.js.map