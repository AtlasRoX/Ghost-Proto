import { RuleRegistry } from './registry';
import { Observation } from './types';
import { AnalysisContext } from '../context';

export class RuleEngine {
  constructor(private registry: RuleRegistry) {}

  public async runAll(ctx: AnalysisContext): Promise<Observation[]> {
    const allObservations: Observation[] = [];
    const rules = this.registry.getRules();

    for (const rule of rules) {
      try {
        const obs = await rule.execute(ctx);
        allObservations.push(...obs);
      } catch (e: any) {
        ctx.diagnostics.push({
          severity: 'error',
          code: 'RULE_EXECUTION_FAILED',
          message: `Rule ${rule.id} failed to execute: ${e.message}`
        });
      }
    }

    return allObservations;
  }
}
