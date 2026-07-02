export interface QueryIntent {
    action: 'FindSymbol' | 'FindReferences' | 'GetMetrics';
    params: Record<string, string>;
}
export interface QueryPlan {
    steps: {
        service: string;
        method: string;
        args: string[];
    }[];
}
export declare class QueryPlanner {
    plan(intent: QueryIntent): QueryPlan;
}
//# sourceMappingURL=planner.d.ts.map