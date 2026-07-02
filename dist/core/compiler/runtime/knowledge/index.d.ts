import { Finding } from '../../analysis/store/evidence';
export interface AuditRecord {
    id: string;
    timestamp: string;
    findings: Finding[];
}
export declare class KnowledgeBase {
    history: AuditRecord[];
    architecturalBaselines: Map<string, number>;
    recordAudit(findings: Finding[]): void;
    setBaselineMetric(metric: string, value: number): void;
    getBaselineMetric(metric: string): number | undefined;
    clear(): void;
}
//# sourceMappingURL=index.d.ts.map