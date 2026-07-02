export interface RuleBenchmark {
  ruleId: string;
  durationMs: number;
  memoryDeltaBytes: number;
  findingsCount: number;
}

export class BenchmarkTracker {
  private benchmarks: RuleBenchmark[] = [];

  public track(
    ruleId: string,
    durationMs: number,
    memoryDeltaBytes: number,
    findingsCount: number
  ): void {
    this.benchmarks.push({
      ruleId,
      durationMs,
      memoryDeltaBytes,
      findingsCount
    });
  }

  public getBenchmarks(): RuleBenchmark[] {
    return this.benchmarks;
  }
}
