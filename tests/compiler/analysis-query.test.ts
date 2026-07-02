import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Analysis Query Engine', () => {
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

  it('should plan and execute analysis queries', async () => {
    const callerSym = ImmutableIRBuilder.createSymbol('Function', 'caller', 'test.ts:caller', span, origin);
    const calleeSym = ImmutableIRBuilder.createSymbol('Function', 'callee', 'test.ts:callee', span, origin);
    const callEdge = ImmutableIRBuilder.createEdge('CALLS', callerSym.id, calleeSym.id, span, origin);

    const index = RepositoryBuilder.build([[callerSym, calleeSym, callEdge]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);

    const result = await analysisCtx.queryEngine.query({
      action: 'TraceCallers',
      params: { funcFqn: 'test.ts:callee' }
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('caller');
  });
});
