"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextOptimizer = void 0;
class ContextOptimizer {
    static optimize(graph, budget) {
        const symbols = graph.getSymbols().slice(0, budget.maxSymbols);
        const findings = graph.getFindings().slice(0, budget.maxEvidence);
        const paths = graph.getPaths().slice(0, budget.maxPaths);
        return {
            symbols,
            findings,
            paths,
            metrics: {
                symbolCount: symbols.length,
                findingsCount: findings.length,
                pathsCount: paths.length
            }
        };
    }
}
exports.ContextOptimizer = ContextOptimizer;
//# sourceMappingURL=optimizer.js.map