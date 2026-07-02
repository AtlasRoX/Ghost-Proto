import { QueryIntent } from './planner';
import { QueryExecutor } from './executor';
export declare class QueryPipeline {
    private executor;
    private planner;
    private optimizer;
    constructor(executor: QueryExecutor);
    query(intent: QueryIntent): Promise<any>;
}
//# sourceMappingURL=pipeline.d.ts.map