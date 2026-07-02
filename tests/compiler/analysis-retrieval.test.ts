import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { RetrievalEngine } from '../../src/core/compiler/analysis/retrieval';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Retrieval Engine', () => {
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

  it('should plan and execute fact retrieval from analysis context', async () => {
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const index = RepositoryBuilder.build([[sym]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);

    // Ingest findings first
    await analysisCtx.analyze();

    const engine = new RetrievalEngine(analysisCtx);
    const evidenceSet = await engine.retrieve({
      filePaths: ['test.ts'],
      symbolFqns: ['test.ts:processQuery']
    });

    expect(evidenceSet.symbols).toHaveLength(1);
    expect(evidenceSet.symbols[0].name).toBe('processQuery');
    expect(evidenceSet.findings).toHaveLength(1);
    expect(evidenceSet.findings[0].ruleId).toBe('GHOST_SQL_INJECTION');
  });
});
