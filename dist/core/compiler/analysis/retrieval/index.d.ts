import { RetrievalIntent } from './planner';
import { RetrievedEvidenceSet } from './executor';
import { AnalysisContext } from '../context';
export declare class RetrievalEngine {
    private planner;
    private executor;
    constructor(ctx: AnalysisContext);
    retrieve(intent: RetrievalIntent): Promise<RetrievedEvidenceSet>;
}
//# sourceMappingURL=index.d.ts.map