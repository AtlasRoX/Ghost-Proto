"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPlanner = void 0;
class QueryPlanner {
    plan(intent) {
        const steps = [];
        if (intent.action === 'FindSymbol') {
            steps.push({
                service: 'symbol',
                method: 'getSymbol',
                args: [intent.params.fqn]
            });
        }
        else if (intent.action === 'FindReferences') {
            steps.push({
                service: 'reference',
                method: 'getReferencesTo',
                args: [intent.params.nodeId]
            });
        }
        else if (intent.action === 'GetMetrics') {
            steps.push({
                service: 'metrics',
                method: 'getMetrics',
                args: []
            });
        }
        return { steps };
    }
}
exports.QueryPlanner = QueryPlanner;
//# sourceMappingURL=planner.js.map