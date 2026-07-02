"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphBuilder = void 0;
const call_1 = require("./call");
const dependency_1 = require("./dependency");
const cfg_1 = require("./cfg");
class GraphBuilder {
    static buildGraphs(context) {
        const callGraph = call_1.CallGraphBuilder.build(context);
        const dependencyGraph = dependency_1.DependencyGraphBuilder.build(context);
        const cfgs = new Map();
        const symbols = Array.from(context.index.symbols.values());
        const functions = symbols.filter(s => s.symbolKind === 'Function');
        for (const func of functions) {
            cfgs.set(func.fqn, cfg_1.CFGBuilder.build(func));
        }
        return {
            callGraph,
            dependencyGraph,
            cfgs
        };
    }
}
exports.GraphBuilder = GraphBuilder;
//# sourceMappingURL=builder.js.map