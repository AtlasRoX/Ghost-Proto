"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindingSuppressionEngine = void 0;
class FindingSuppressionEngine {
    constructor(globalSuppressions = []) {
        this.globalRules = new Map();
        for (const rule of globalSuppressions) {
            this.globalRules.set(rule.findingId, rule);
        }
    }
    filterSuppressions(findings) {
        const active = [];
        const suppressed = [];
        const now = new Date();
        for (const finding of findings) {
            const rule = this.globalRules.get(finding.id);
            let isSuppressed = false;
            let reason = 'justified';
            if (rule) {
                if (rule.expiryDate) {
                    const expiry = new Date(rule.expiryDate);
                    if (expiry > now) {
                        isSuppressed = true;
                        reason = rule.reason;
                    }
                }
                else {
                    isSuppressed = true;
                    reason = rule.reason;
                }
            }
            // Also check if findings metadata contains inline suppressions
            const metadata = finding.evidence[0]?.flowTrace;
            const hasInlineSuppression = metadata?.some(step => step.includes('ghost-suppress') || step.includes('suppress'));
            if (hasInlineSuppression) {
                isSuppressed = true;
                reason = 'inline suppression comment';
            }
            if (isSuppressed) {
                suppressed.push({ findingId: finding.id, reason });
            }
            else {
                active.push(finding);
            }
        }
        return { active, suppressed };
    }
}
exports.FindingSuppressionEngine = FindingSuppressionEngine;
//# sourceMappingURL=engine.js.map