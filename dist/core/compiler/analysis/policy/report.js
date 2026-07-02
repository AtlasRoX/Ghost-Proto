"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceReportBuilder = void 0;
class ComplianceReportBuilder {
    static build(policyName, rulePacks, violations, suppressions) {
        const status = violations.length === 0 ? 'PASSED' : 'FAILED';
        return {
            policyName,
            status,
            evaluatedAt: new Date().toISOString(),
            rulePacksLoaded: rulePacks,
            findingsCount: violations.length + suppressions.length,
            violationsCount: violations.length,
            suppressionsAppliedCount: suppressions.length,
            violations,
            suppressions
        };
    }
}
exports.ComplianceReportBuilder = ComplianceReportBuilder;
//# sourceMappingURL=report.js.map