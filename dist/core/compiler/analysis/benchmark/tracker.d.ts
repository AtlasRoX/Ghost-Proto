export interface RuleBenchmark {
    ruleId: string;
    durationMs: number;
    memoryDeltaBytes: number;
    findingsCount: number;
}
export declare class BenchmarkTracker {
    private benchmarks;
    track(ruleId: string, durationMs: number, memoryDeltaBytes: number, findingsCount: number): void;
    getBenchmarks(): RuleBenchmark[];
}
//# sourceMappingURL=tracker.d.ts.map