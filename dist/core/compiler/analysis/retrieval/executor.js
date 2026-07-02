"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalExecutor = void 0;
const dependency_1 = require("../trace/dependency");
class RetrievalExecutor {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async execute(plan) {
        const symbolsSet = new Map();
        const findingsList = [];
        const pathsList = [];
        const allSymbols = Array.from(this.ctx.repository.index.symbols.values());
        const depTracer = new dependency_1.DependencyTracer(this.ctx.repository);
        for (const step of plan.steps) {
            if (step.action === 'FetchSymbols') {
                const fqns = step.args[0];
                for (const fqn of fqns) {
                    const sym = allSymbols.find(s => s.fqn === fqn);
                    if (sym)
                        symbolsSet.set(sym.id, sym);
                }
            }
            else if (step.action === 'FetchFindings') {
                const files = step.args[0];
                const allFindings = this.ctx.evidenceStore.getFindings();
                for (const finding of allFindings) {
                    if (files.includes(finding.filePath)) {
                        findingsList.push(finding);
                        // Also retrieve associated symbol if present
                        if (finding.symbolFqn) {
                            const sym = allSymbols.find(s => s.fqn === finding.symbolFqn);
                            if (sym)
                                symbolsSet.set(sym.id, sym);
                        }
                    }
                }
            }
            else if (step.action === 'FetchPaths') {
                const files = step.args[0];
                if (files.length >= 2) {
                    const chain = depTracer.traceDependencyChain(files[0], files[1]);
                    if (chain)
                        pathsList.push(chain);
                }
            }
        }
        return {
            symbols: Array.from(symbolsSet.values()),
            findings: findingsList,
            paths: pathsList
        };
    }
}
exports.RetrievalExecutor = RetrievalExecutor;
//# sourceMappingURL=executor.js.map