import { QueryPlanner, QueryIntent } from './planner';
import { QueryOptimizer } from './optimizer';
import { QueryExecutor } from './executor';

export class QueryPipeline {
  private planner = new QueryPlanner();
  private optimizer = new QueryOptimizer();

  constructor(private executor: QueryExecutor) {}

  public async query(intent: QueryIntent): Promise<any> {
    const rawPlan = this.planner.plan(intent);
    const optimizedPlan = this.optimizer.optimize(rawPlan);
    const results = await this.executor.execute(optimizedPlan);
    return results.length === 1 ? results[0] : results;
  }
}
