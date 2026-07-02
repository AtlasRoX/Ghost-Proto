import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { NavigationService } from '../../src/core/compiler/analysis/navigation';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';
import { IRNode } from '../../src/core/compiler/schema/nodes';

describe('Navigation Platform', () => {
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

  it('should find callers and definitions correctly', () => {
    const callerSym = ImmutableIRBuilder.createSymbol('Function', 'caller', 'test.ts:caller', span, origin);
    const calleeSym = ImmutableIRBuilder.createSymbol('Function', 'callee', 'test.ts:callee', span, origin);

    const callEdge = ImmutableIRBuilder.createEdge('CALLS', callerSym.id, calleeSym.id, span, origin);

    const index = RepositoryBuilder.build([[callerSym, calleeSym, callEdge]]);
    const repoCtx = new RepositoryContext(index);
    const nav = new NavigationService(repoCtx);

    const callers = nav.findCallers('test.ts:callee');
    expect(callers).toHaveLength(1);
    expect(callers[0].name).toBe('caller');

    const callees = nav.findCallees('test.ts:caller');
    expect(callees).toHaveLength(1);
    expect(callees[0].name).toBe('callee');
  });
});
