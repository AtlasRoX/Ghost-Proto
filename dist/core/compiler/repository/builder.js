"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBuilder = void 0;
const index_1 = require("./index");
class RepositoryBuilder {
    static build(compilationUnits) {
        const index = new index_1.RepositoryIndex();
        for (const unit of compilationUnits) {
            for (const node of unit) {
                if (node.kind === 'Symbol') {
                    index.addSymbol(node);
                }
                else if (node.kind === 'Edge') {
                    index.edges.push(node);
                }
            }
        }
        // Cross-file reference resolution
        this.resolveCrossFileReferences(index);
        return index;
    }
    static resolveCrossFileReferences(index) {
        const symbols = Array.from(index.symbols.values());
        const imports = symbols.filter(s => s.symbolKind === 'Variable' && s.metadata.isImport);
        for (const imp of imports) {
            const resolvedPath = imp.metadata.resolvedPath;
            if (resolvedPath) {
                // Resolve import to a target Module in the index
                const targetModule = index.getSymbol(resolvedPath);
                if (targetModule) {
                    imp.metadata.targetSymbolId = targetModule.id;
                }
            }
        }
    }
}
exports.RepositoryBuilder = RepositoryBuilder;
//# sourceMappingURL=builder.js.map