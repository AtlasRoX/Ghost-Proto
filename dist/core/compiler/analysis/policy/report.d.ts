import { Finding } from '../store/evidence';
export interface ComplianceReport {
    policyName: string;
    status: 'PASSED' | 'FAILED';
    evaluatedAt: string;
    rulePacksLoaded: string[];
    findingsCount: number;
    violationsCount: number;
    suppressionsAppliedCount: number;
    violations: Finding[];
    suppressions: {
        findingId: string;
        reason: string;
    }[];
}
export declare class ComplianceReportBuilder {
    static build(policyName: string, rulePacks: string[], violations: Finding[], suppressions: {
        findingId: string;
        reason: string;
    }[]): ComplianceReport;
}
//# sourceMappingURL=report.d.ts.map