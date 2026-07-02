import { AnalysisQueryPlanner, AnalysisQueryIntent } from './planner';
import { AnalysisQueryExecutor } from './executor';

export class AnalysisQueryEngine {
  private planner = new AnalysisQueryPlanner();

  constructor(private executor: AnalysisQueryExecutor) {}

  public async query(intent: AnalysisQueryIntent): Promise<any> {
    const plan = this.planner.plan(intent);
    const results = await this.executor.execute(plan);
    return results.length === 1 ? results[0] : results;
  }
}
