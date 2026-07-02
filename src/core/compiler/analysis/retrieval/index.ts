import { RetrievalPlanner, RetrievalIntent } from './planner';
import { RetrievalExecutor, RetrievedEvidenceSet } from './executor';
import { AnalysisContext } from '../context';

export class RetrievalEngine {
  private planner = new RetrievalPlanner();
  private executor: RetrievalExecutor;

  constructor(ctx: AnalysisContext) {
    this.executor = new RetrievalExecutor(ctx);
  }

  public async retrieve(intent: RetrievalIntent): Promise<RetrievedEvidenceSet> {
    const plan = this.planner.plan(intent);
    return this.executor.execute(plan);
  }
}
