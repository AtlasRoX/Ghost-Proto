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
export declare class EvidenceStore {
    private findings;
    ingest(observations: Observation[]): void;
    getFindings(): Finding[];
    clear(): void;
}
//# sourceMappingURL=evidence.d.ts.map