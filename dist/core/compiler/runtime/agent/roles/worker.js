"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultWorkerRole = void 0;
class DefaultWorkerRole {
    async execute(task, ctx) {
        ctx.logEvent('AGENT_WORKER_EXECUTE', `Running worker task: ${task.name}`);
        // Fetch findings statically and wrap them as CandidateFindings with confidence scores
        const findings = await ctx.analysis.analyze();
        const candidates = findings.map(f => ({
            id: `cand_${f.id}`,
            finding: f,
            confidence: f.severity === 'high' ? 0.9 : 0.7,
            sourceWorker: 'DefaultWorker'
        }));
        return candidates;
    }
}
exports.DefaultWorkerRole = DefaultWorkerRole;
//# sourceMappingURL=worker.js.map