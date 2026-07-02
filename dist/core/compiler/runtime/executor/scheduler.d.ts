import { ExecutionDAG } from './dag';
import { ExecutionContext } from '../context';
export declare class ExecutionScheduler {
    private workers;
    execute(dag: ExecutionDAG, ctx: ExecutionContext): Promise<void>;
}
//# sourceMappingURL=scheduler.d.ts.map