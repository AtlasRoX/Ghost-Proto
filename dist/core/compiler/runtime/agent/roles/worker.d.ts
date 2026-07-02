import { WorkerRole, CandidateFinding } from './interface';
import { ExecutionTask } from '../../executor/dag';
import { ExecutionContext } from '../../context';
export declare class DefaultWorkerRole implements WorkerRole {
    execute(task: ExecutionTask, ctx: ExecutionContext): Promise<CandidateFinding[]>;
}
//# sourceMappingURL=worker.d.ts.map