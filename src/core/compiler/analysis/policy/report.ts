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
  suppressions: { findingId: string; reason: string }[];
}

export class ComplianceReportBuilder {
  public static build(
    policyName: string,
    rulePacks: string[],
    violations: Finding[],
    suppressions: { findingId: string; reason: string }[]
  ): ComplianceReport {
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
