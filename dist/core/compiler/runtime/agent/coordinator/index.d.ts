import { AuditObjective } from '../roles/interface';
import { ExecutionContext } from '../../context';
export declare class AgentCoordinator {
    private planner;
    private worker;
    private reviewer;
    private judge;
    private consensus;
    private scheduler;
    run(objective: AuditObjective, ctx: ExecutionContext): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map