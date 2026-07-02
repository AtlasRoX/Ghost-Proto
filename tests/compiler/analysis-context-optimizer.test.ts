import { ContextBuilder } from '../../src/core/compiler/analysis/context-builder';
import { ContextBudget } from '../../src/core/compiler/analysis/context-builder/schema';
import { RetrievedEvidenceSet } from '../../src/core/compiler/analysis/retrieval/executor';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Context Builder & Optimizer', () => {
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

  it('should compile context graphs and optimize them within budgets', () => {
    const sym1 = ImmutableIRBuilder.createSymbol('Function', 'func1', 'test.ts:func1', span, origin);
    const sym2 = ImmutableIRBuilder.createSymbol('Function', 'func2', 'test.ts:func2', span, origin);

    const evidence: RetrievedEvidenceSet = {
      symbols: [sym1, sym2],
      findings: [],
      paths: [['fileA.ts', 'fileB.ts']]
    };

    const budget: ContextBudget = {
      maxFiles: 1,
      maxSymbols: 1,
      maxEvidence: 5,
      maxPaths: 0
    };

    const pkg = ContextBuilder.buildPackage(evidence, budget, 'PCI compliance');

    expect(pkg.policyName).toBe('PCI compliance');
    expect(pkg.symbols).toHaveLength(1); // Clipped by budget.maxSymbols
    expect(pkg.symbols[0].name).toBe('func1');
    expect(pkg.paths).toHaveLength(0); // Clipped by budget.maxPaths
  });
});
