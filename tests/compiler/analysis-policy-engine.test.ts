import { CompliancePolicyEngine } from '../../src/core/compiler/analysis/policy/engine';
import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('CompliancePolicyEngine', () => {
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

  it('should parse policy DSL and identify dependency & complexity violations', async () => {
    // Symbol with high complexity
    const funcSym = ImmutableIRBuilder.createSymbol('Function', 'complexFunc', 'test.ts:complexFunc', span, origin, undefined, {
      cyclomatic: 15
    });

    // Dependency from main to forbidden-lib
    const modMain = ImmutableIRBuilder.createSymbol('Module', 'main.ts', 'main.ts', { ...span, file: 'main.ts' }, origin);
    const impB = ImmutableIRBuilder.createSymbol('Variable', 'lib', 'main.ts:import:lib', { ...span, file: 'main.ts' }, origin, 'main.ts', {
      isImport: true,
      resolvedPath: 'forbidden-lib.ts'
    });
    const modLib = ImmutableIRBuilder.createSymbol('Module', 'forbidden-lib.ts', 'forbidden-lib.ts', { ...span, file: 'forbidden-lib.ts' }, origin);

    const index = RepositoryBuilder.build([[funcSym], [modMain, impB], [modLib]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);

    const config = JSON.stringify({
      name: 'PCI Security Policy',
      forbiddenDependencies: ['forbidden-lib.ts'],
      complexityLimits: { cyclomatic: 10 },
      requiredRulePacks: ['security-core']
    });

    const policyEngine = new CompliancePolicyEngine(config);
    const report = await policyEngine.evaluate(analysisCtx);

    expect(report.policyName).toBe('PCI Security Policy');
    expect(report.status).toBe('FAILED');
    expect(report.violationsCount).toBe(2); // 1 dependency + 1 complexity violation
    
    const violationIds = report.violations.map(v => v.ruleId);
    expect(violationIds).toContain('FORBIDDEN_DEPENDENCY');
    expect(violationIds).toContain('COMPLEXITY_EXCEEDED');
  });
});
