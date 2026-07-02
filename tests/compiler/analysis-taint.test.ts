import { SSATransformer } from '../../src/core/compiler/analysis/engine/ssa';
import { TaintTracer } from '../../src/core/compiler/analysis/engine/taint';

describe('SSA Transformation & Taint Tracking', () => {
  it('should transform sequential code statements into versioned SSA statements', () => {
    const code = [
      'param input',
      'x = input',
      'y = x + 1',
      'x = 10'
    ];

    const ssa = SSATransformer.transform(code);
    expect(ssa).toHaveLength(4);

    // Assert version assignments
    expect(ssa[0].defined).toEqual({ name: 'input', version: 0 });
    expect(ssa[1].defined).toEqual({ name: 'x', version: 0 });
    expect(ssa[1].used).toEqual([{ name: 'input', version: 0 }]);
    expect(ssa[2].defined).toEqual({ name: 'y', version: 0 });
    expect(ssa[2].used).toEqual([{ name: 'x', version: 0 }]);
    // Reassigned x should get version 1
    expect(ssa[3].defined).toEqual({ name: 'x', version: 1 });
  });

  it('should trace taint propagation path from sources to sinks', () => {
    const code = [
      'param userInput',
      'query = userInput',
      'res = db.query(query)'
    ];

    const ssa = SSATransformer.transform(code);
    const trace = TaintTracer.trace(ssa, ['userInput'], ['db.query']);

    expect(trace).toHaveLength(1);
    expect(trace[0].source).toBe('userInput');
    expect(trace[0].sink).toContain('db.query');
    expect(trace[0].steps).toContain('query_0 = userInput');
  });
});
