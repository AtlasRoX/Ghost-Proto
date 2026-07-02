import { RetrievalPlan } from './planner';
import { AnalysisContext } from '../context';
import { IRSymbol } from '../../schema/nodes';
import { Finding } from '../store/evidence';
export interface RetrievedEvidenceSet {
    symbols: IRSymbol[];
    findings: Finding[];
    paths: string[][];
}
export declare class RetrievalExecutor {
    private ctx;
    constructor(ctx: AnalysisContext);
    execute(plan: RetrievalPlan): Promise<RetrievedEvidenceSet>;
}
//# sourceMappingURL=executor.d.ts.map