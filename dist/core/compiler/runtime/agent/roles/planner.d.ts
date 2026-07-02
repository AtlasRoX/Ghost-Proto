import { PlannerRole, AuditObjective } from './interface';
import { ExecutionTask } from '../../executor/dag';
import { ExecutionContext } from '../../context';
export declare class DefaultPlannerRole implements PlannerRole {
    plan(objective: AuditObjective, _ctx: ExecutionContext): Promise<ExecutionTask[]>;
}
//# sourceMappingURL=planner.d.ts.map