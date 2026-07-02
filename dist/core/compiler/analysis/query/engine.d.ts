import { AnalysisQueryIntent } from './planner';
import { AnalysisQueryExecutor } from './executor';
export declare class AnalysisQueryEngine {
    private executor;
    private planner;
    constructor(executor: AnalysisQueryExecutor);
    query(intent: AnalysisQueryIntent): Promise<any>;
}
//# sourceMappingURL=engine.d.ts.map