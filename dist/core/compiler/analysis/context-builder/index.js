"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
const graph_1 = require("./graph");
const optimizer_1 = require("./optimizer");
class ContextBuilder {
    static buildPackage(evidence, budget, policyName) {
        const graph = new graph_1.ContextGraph();
        // Ingest findings
        for (const finding of evidence.findings) {
            graph.addNode({
                id: finding.id,
                type: 'finding',
                data: finding
            });
        }
        // Ingest symbols
        for (const sym of evidence.symbols) {
            graph.addNode({
                id: sym.id,
                type: 'symbol',
                data: sym
            });
        }
        // Ingest dependency paths
        for (let i = 0; i < evidence.paths.length; i++) {
            const path = evidence.paths[i];
            graph.addNode({
                id: `path:${i}`,
                type: 'path',
                data: path
            });
        }
        // Optimize against budget limits
        const pkg = optimizer_1.ContextOptimizer.optimize(graph, budget);
        pkg.policyName = policyName;
        return pkg;
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=index.js.map