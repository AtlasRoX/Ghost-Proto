"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyTracer = void 0;
class DependencyTracer {
    constructor(repo) {
        this.repo = repo;
    }
    traceDependencyChain(fromFile, toFile) {
        // DFS/BFS path finding through the imports index
        const visited = new Set();
        const path = [];
        const dfs = (curr) => {
            visited.add(curr);
            path.push(curr);
            if (curr === toFile) {
                return true;
            }
            // Get outbound imports of curr
            const imports = Array.from(this.repo.index.symbols.values()).filter(s => s.span?.file === curr && s.symbolKind === 'Variable' && s.metadata.isImport);
            for (const imp of imports) {
                const resolved = imp.metadata.resolvedPath;
                if (resolved && !visited.has(resolved)) {
                    if (dfs(resolved)) {
                        return true;
                    }
                }
            }
            path.pop();
            return false;
        };
        if (dfs(fromFile)) {
            return path;
        }
        return null;
    }
}
exports.DependencyTracer = DependencyTracer;
//# sourceMappingURL=dependency.js.map