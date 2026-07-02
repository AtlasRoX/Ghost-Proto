export interface AnalysisQueryIntent {
    action: 'NavigateDefinition' | 'TraceCallers' | 'TraceTaint';
    params: Record<string, string>;
}
export interface AnalysisQueryPlan {
    steps: {
        service: string;
        method: string;
        args: any[];
    }[];
}
export declare class AnalysisQueryPlanner {
    plan(intent: AnalysisQueryIntent): AnalysisQueryPlan;
}
//# sourceMappingURL=planner.d.ts.map