import { RulePack } from '../../src/core/compiler/analysis/rules/pack';
import { BenchmarkTracker } from '../../src/core/compiler/analysis/benchmark/tracker';
import { Rule } from '../../src/core/compiler/analysis/rules/types';

describe('Rule Packs & Benchmarking', () => {
  it('should validate prerequisite capabilities for dynamic rule packs', () => {
    const mockRule: Rule = {
      id: 'RULE_01',
      name: 'Mock Rule',
      description: 'Mock',
      severity: 'low',
      category: 'performance',
      execute: async () => []
    };

    const pack = new RulePack(
      {
        id: 'mock-pack',
        version: '1.0.0',
        depends: [],
        capabilities: ['cfg', 'ssa']
      },
      [mockRule]
    );

    const result = pack.validatePrerequisites(['cfg']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ssa');

    const result2 = pack.validatePrerequisites(['cfg', 'ssa', 'extra']);
    expect(result2.valid).toBe(true);
    expect(result2.missing).toHaveLength(0);
  });

  it('should track benchmarks including duration, memory, and findings count', () => {
    const tracker = new BenchmarkTracker();
    tracker.track('GHOST_SQL_INJECTION', 15.5, 1024, 2);

    const benchmarks = tracker.getBenchmarks();
    expect(benchmarks).toHaveLength(1);
    expect(benchmarks[0].ruleId).toBe('GHOST_SQL_INJECTION');
    expect(benchmarks[0].durationMs).toBe(15.5);
    expect(benchmarks[0].memoryDeltaBytes).toBe(1024);
    expect(benchmarks[0].findingsCount).toBe(2);
  });
});
