"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceStore = void 0;
class EvidenceStore {
    constructor() {
        this.findings = new Map();
    }
    ingest(observations) {
        for (const obs of observations) {
            const existing = this.findings.get(obs.id);
            if (existing) {
                // Append additional evidence trace if finding is already identified
                existing.evidence.push({
                    observationId: obs.id,
                    sourceFiles: [obs.filePath],
                    flowTrace: obs.evidence
                });
            }
            else {
                const finding = {
                    id: obs.id,
                    ruleId: obs.ruleId,
                    filePath: obs.filePath,
                    symbolFqn: obs.symbolFqn,
                    severity: obs.severity,
                    message: obs.message,
                    evidence: [
                        {
                            observationId: obs.id,
                            sourceFiles: [obs.filePath],
                            flowTrace: obs.evidence
                        }
                    ]
                };
                this.findings.set(obs.id, finding);
            }
        }
    }
    getFindings() {
        return Array.from(this.findings.values());
    }
    clear() {
        this.findings.clear();
    }
}
exports.EvidenceStore = EvidenceStore;
//# sourceMappingURL=evidence.js.map