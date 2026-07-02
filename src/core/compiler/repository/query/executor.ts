import { QueryPlan } from './planner';
import { SymbolService } from '../services/symbol';
import { ReferenceService } from '../services/reference';
import { MetricsService } from '../services/metrics';

export class QueryExecutor {
  constructor(
    private symbolService: SymbolService,
    private referenceService: ReferenceService,
    private metricsService: MetricsService
  ) {}

  public async execute(plan: QueryPlan): Promise<any[]> {
    const results: any[] = [];

    for (const step of plan.steps) {
      if (step.service === 'symbol' && step.method === 'getSymbol') {
        results.push(this.symbolService.getSymbol(step.args[0]));
      } else if (step.service === 'reference' && step.method === 'getReferencesTo') {
        results.push(this.referenceService.getReferencesTo(step.args[0]));
      } else if (step.service === 'metrics' && step.method === 'getMetrics') {
        results.push(this.metricsService.getMetrics());
      }
    }

    return results;
  }
}
