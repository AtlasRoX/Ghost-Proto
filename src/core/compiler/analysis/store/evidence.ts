import { Observation } from '../rules/types';

export interface EvidenceRecord {
  observationId: string;
  sourceFiles: string[];
  flowTrace: string[];
}

export interface Finding {
  id: string;
  ruleId: string;
  filePath: string;
  symbolFqn?: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  message: string;
  evidence: EvidenceRecord[];
}

export class EvidenceStore {
  private findings = new Map<string, Finding>();

  public ingest(observations: Observation[]): void {
    for (const obs of observations) {
      const existing = this.findings.get(obs.id);
      if (existing) {
        // Append additional evidence trace if finding is already identified
        existing.evidence.push({
          observationId: obs.id,
          sourceFiles: [obs.filePath],
          flowTrace: obs.evidence
        });
      } else {
        const finding: Finding = {
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

  public getFindings(): Finding[] {
    return Array.from(this.findings.values());
  }

  public clear(): void {
    this.findings.clear();
  }
}
