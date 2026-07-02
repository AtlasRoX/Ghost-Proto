import { QueryPlan } from './planner';
import { SymbolService } from '../services/symbol';
import { ReferenceService } from '../services/reference';
import { MetricsService } from '../services/metrics';
export declare class QueryExecutor {
    private symbolService;
    private referenceService;
    private metricsService;
    constructor(symbolService: SymbolService, referenceService: ReferenceService, metricsService: MetricsService);
    execute(plan: QueryPlan): Promise<any[]>;
}
//# sourceMappingURL=executor.d.ts.map