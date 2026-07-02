import { Finding } from '../../analysis/store/evidence';

export interface AuditRecord {
  id: string;
  timestamp: string;
  findings: Finding[];
}

export class KnowledgeBase {
  public history: AuditRecord[] = [];
  public architecturalBaselines = new Map<string, number>();

  public recordAudit(findings: Finding[]): void {
    this.history.push({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      findings
    });
  }

  public setBaselineMetric(metric: string, value: number): void {
    this.architecturalBaselines.set(metric, value);
  }

  public getBaselineMetric(metric: string): number | undefined {
    return this.architecturalBaselines.get(metric);
  }

  public clear(): void {
    this.history = [];
    this.architecturalBaselines.clear();
  }
}
