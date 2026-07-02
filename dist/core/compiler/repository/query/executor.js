"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryExecutor = void 0;
class QueryExecutor {
    constructor(symbolService, referenceService, metricsService) {
        this.symbolService = symbolService;
        this.referenceService = referenceService;
        this.metricsService = metricsService;
    }
    async execute(plan) {
        const results = [];
        for (const step of plan.steps) {
            if (step.service === 'symbol' && step.method === 'getSymbol') {
                results.push(this.symbolService.getSymbol(step.args[0]));
            }
            else if (step.service === 'reference' && step.method === 'getReferencesTo') {
                results.push(this.referenceService.getReferencesTo(step.args[0]));
            }
            else if (step.service === 'metrics' && step.method === 'getMetrics') {
                results.push(this.metricsService.getMetrics());
            }
        }
        return results;
    }
}
exports.QueryExecutor = QueryExecutor;
//# sourceMappingURL=executor.js.map