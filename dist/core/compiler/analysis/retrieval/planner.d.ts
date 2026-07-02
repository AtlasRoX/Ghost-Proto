export interface RetrievalIntent {
    filePaths: string[];
    symbolFqns: string[];
}
export interface RetrievalPlan {
    steps: {
        action: 'FetchSymbols' | 'FetchFindings' | 'FetchPaths';
        args: any[];
    }[];
}
export declare class RetrievalPlanner {
    plan(intent: RetrievalIntent): RetrievalPlan;
}
//# sourceMappingURL=planner.d.ts.map