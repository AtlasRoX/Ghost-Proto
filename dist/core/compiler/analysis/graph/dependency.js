"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraphBuilder = void 0;
class DependencyGraphBuilder {
    static build(context) {
        const edges = [];
        const symbols = Array.from(context.index.symbols.values());
        const imports = symbols.filter(s => s.symbolKind === 'Variable' && s.metadata.isImport);
        for (const imp of imports) {
            const resolvedPath = imp.metadata.resolvedPath;
            const file = imp.span?.file;
            if (resolvedPath && file) {
                edges.push({
                    fromModule: file,
                    toModule: resolvedPath
                });
            }
        }
        return edges;
    }
}
exports.DependencyGraphBuilder = DependencyGraphBuilder;
//# sourceMappingURL=dependency.js.map