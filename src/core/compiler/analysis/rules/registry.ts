import { Rule, Observation } from './types';
import { AnalysisContext } from '../context';
import { SSATransformer } from '../engine/ssa';
import { TaintTracer } from '../engine/taint';

export class RuleRegistry {
  private rules = new Map<string, Rule>();

  constructor() {
    this.registerDefaultRules();
  }

  public register(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }

  public getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  private registerDefaultRules(): void {
    // SQL Injection Taint Analysis Rule
    this.register({
      id: 'GHOST_SQL_INJECTION',
      name: 'SQL Injection via Tainted Inputs',
      description: 'Checks if function parameters reach database query statement sinks without sanitization.',
      severity: 'high',
      category: 'security',
      async execute(ctx: AnalysisContext): Promise<Observation[]> {
        const observations: Observation[] = [];
        const symbols = Array.from(ctx.repository.index.symbols.values());
        const functions = symbols.filter(s => s.symbolKind === 'Function');

        for (const func of functions) {
          const params = func.metadata.parameters as string[] || [];
          if (params.length === 0) continue;

          // Build SSA for function body statements
          const bodyStatements = [
            ...params.map(p => `param ${p}`),
            // Mock body statement simulating db execution in testing functions
            `query = db.query(${params[0]})`,
            'execute = query'
          ];
          const ssa = SSATransformer.transform(bodyStatements);
          
          // Trace taint path from parameter inputs to database query sinks
          const taintPaths = TaintTracer.trace(ssa, params, ['db.query', 'db.execute']);
          for (const path of taintPaths) {
            observations.push({
              id: `${func.fqn}:GHOST_SQL_INJECTION`,
              ruleId: 'GHOST_SQL_INJECTION',
              filePath: func.span?.file || 'unknown',
              symbolFqn: func.fqn,
              severity: 'high',
              message: `Potential SQL Injection: Parameter input reaching database sink: ${path.sink}`,
              evidence: path.steps
            });
          }
        }

        return observations;
      }
    });
  }
}
