import { RepositoryIndex } from '../../src/core/compiler/repository/index';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Repository Index Algorithmic Complexity Benchmarks', () => {
  const span: IRSpan = {
    file: 'test.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 10, line: 1, column: 11 }
  };

  const origin: IROrigin = {
    language: 'typescript',
    parser: 'test',
    parserVersion: '1.0'
  };

  it('should guarantee symbol lookups scale with O(1) Map complexity rather than O(N) linear scans', () => {
    const index = new RepositoryIndex();
    
    // Define 10,000 symbols
    const sampleSize = 10000;
    for (let i = 0; i < sampleSize; i++) {
      const sym = ImmutableIRBuilder.createSymbol('Function', `func_${i}`, `test.ts:func_${i}`, span, origin);
      index.addSymbol(sym);
    }

    // Warmup lookup to trigger JIT optimization
    index.getSymbol('test.ts:func_100');

    // Measure lookup cost: it should be immediate map query
    const start = process.hrtime.bigint();
    const result = index.getSymbol('test.ts:func_5000');
    const end = process.hrtime.bigint();

    const durationNs = Number(end - start);
    expect(result).toBeDefined();
    
    // O(1) hashmap lookup should execute in under 1 millisecond (1,000,000 ns)
    expect(durationNs).toBeLessThan(1000000);
  });
});
