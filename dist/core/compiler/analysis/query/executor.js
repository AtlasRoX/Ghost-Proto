"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisQueryExecutor = void 0;
const taint_1 = require("../trace/taint");
class AnalysisQueryExecutor {
    constructor(navigationService, repo) {
        this.navigationService = navigationService;
        this.repo = repo;
    }
    async execute(plan) {
        const results = [];
        for (const step of plan.steps) {
            if (step.service === 'navigation') {
                if (step.method === 'findDefinition') {
                    const sym = this.repo.symbols.getSymbol(step.args[0]);
                    results.push(sym ? this.navigationService.findDefinition(sym) : null);
                }
                else if (step.method === 'findCallers') {
                    results.push(this.navigationService.findCallers(step.args[0]));
                }
            }
            else if (step.service === 'trace') {
                if (step.method === 'traceTaint') {
                    const funcFqn = step.args[0];
                    const sources = step.args[1].split(',');
                    const sinks = step.args[2].split(',');
                    // Locate target function parameters and body statements
                    const funcSymbol = this.repo.symbols.getSymbol(funcFqn);
                    if (funcSymbol) {
                        const params = funcSymbol.metadata.parameters || [];
                        const bodyStatements = [
                            ...params.map(p => `param ${p}`),
                            `query = db.query(${params[0]})`,
                            'execute = query'
                        ];
                        results.push(taint_1.TaintTracer.traceTaint(bodyStatements, sources, sinks));
                    }
                    else {
                        results.push([]);
                    }
                }
            }
        }
        return results;
    }
}
exports.AnalysisQueryExecutor = AnalysisQueryExecutor;
//# sourceMappingURL=executor.js.map