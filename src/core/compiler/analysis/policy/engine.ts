import { AnalysisContext } from '../context';
import { CompliancePolicy, PolicyParser } from './parser';
import { ComplianceReport, ComplianceReportBuilder } from './report';
import { FindingSuppressionEngine } from '../suppress/engine';
import { SuppressionRule } from '../suppress/types';
import { Finding } from '../store/evidence';

export class CompliancePolicyEngine {
  private policy: CompliancePolicy;

  constructor(policyConfigStr: string) {
    this.policy = PolicyParser.parse(policyConfigStr);
  }

  public async evaluate(
    ctx: AnalysisContext,
    globalSuppressions: SuppressionRule[] = []
  ): Promise<ComplianceReport> {
    const violations: Finding[] = [];

    // 1. Evaluate forbidden dependencies
    const dependencyGraph = ctx.dependencyGraph;
    for (const dep of dependencyGraph) {
      if (this.policy.forbiddenDependencies.includes(dep.toModule)) {
        violations.push({
          id: `dep:${dep.fromModule}:${dep.toModule}`,
          ruleId: 'FORBIDDEN_DEPENDENCY',
          filePath: dep.fromModule,
          severity: 'high',
          message: `Forbidden dependency used: ${dep.toModule}`,
          evidence: [{ observationId: 'FORBIDDEN_DEP', sourceFiles: [dep.fromModule], flowTrace: [`imports ${dep.toModule}`] }]
        });
      }
    }

    // 2. Evaluate complexity limits
    if (this.policy.complexityLimits?.cyclomatic) {
      const limit = this.policy.complexityLimits.cyclomatic;
      const symbols = Array.from(ctx.repository.index.symbols.values());
      const functions = symbols.filter(s => s.symbolKind === 'Function');

      for (const func of functions) {
        const cyclomatic = func.metadata.cyclomatic as number || 0;
        if (cyclomatic > limit) {
          violations.push({
            id: `complexity:${func.fqn}`,
            ruleId: 'COMPLEXITY_EXCEEDED',
            filePath: func.span?.file || 'unknown',
            symbolFqn: func.fqn,
            severity: 'medium',
            message: `Function ${func.name} exceeded cyclomatic complexity limit (${cyclomatic} > ${limit})`,
            evidence: [{ observationId: 'COMPLEXITY', sourceFiles: [func.span?.file || 'unknown'], flowTrace: [`cyclomatic = ${cyclomatic}`] }]
          });
        }
      }
    }

    // 3. Run Analysis findings
    const ruleFindings = await ctx.analyze();
    violations.push(...ruleFindings);

    // 4. Run Suppression filtering
    const suppressionEngine = new FindingSuppressionEngine(globalSuppressions);
    const { active, suppressed } = suppressionEngine.filterSuppressions(violations);

    // 5. Build compliance report
    return ComplianceReportBuilder.build(
      this.policy.name,
      this.policy.requiredRulePacks,
      active,
      suppressed
    );
  }
}
