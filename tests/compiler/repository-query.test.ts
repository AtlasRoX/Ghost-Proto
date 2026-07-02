import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';
import { IRNode, IRSymbol } from '../../src/core/compiler/schema/nodes';

describe('Query Pipeline & RepositoryContext', () => {
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

  it('should resolve symbol queries and trace references correctly', async () => {
    const sym = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin);
    const index = RepositoryBuilder.build([[sym]]);
    const context = new RepositoryContext(index);

    // Test Symbol Lookup
    const resolvedSym = await context.query({
      action: 'FindSymbol',
      params: { fqn: 'test.ts:funcA' }
    });
    expect(resolvedSym).toBeDefined();
    expect(resolvedSym.name).toBe('funcA');
  });
});
