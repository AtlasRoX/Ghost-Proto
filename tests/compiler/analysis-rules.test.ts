import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('AnalysisContext & Rule Engine', () => {
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

  it('should run rules and store findings containing taint trace evidence', async () => {
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const index = RepositoryBuilder.build([[sym]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);

    const findings = await analysisCtx.analyze();
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe('GHOST_SQL_INJECTION');
    expect(findings[0].symbolFqn).toBe('test.ts:processQuery');
    expect(findings[0].evidence[0].flowTrace).toBeDefined();
  });
});
