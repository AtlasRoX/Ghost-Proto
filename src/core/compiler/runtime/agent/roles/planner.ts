import { PlannerRole, AuditObjective } from './interface';
import { ExecutionTask } from '../../executor/dag';
import { ExecutionContext } from '../../context';

export class DefaultPlannerRole implements PlannerRole {
  public async plan(objective: AuditObjective, _ctx: ExecutionContext): Promise<ExecutionTask[]> {
    return [
      {
        id: 'task_worker_run',
        name: `Analyze ${objective.category}`,
        workerType: 'rule',
        payload: { rulePacks: objective.rulePacks },
        dependencies: [],
        retries: 1,
        timeoutMs: 5000
      }
    ];
  }
}
