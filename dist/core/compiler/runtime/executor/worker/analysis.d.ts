import { Worker } from './types';
import { ExecutionTask } from '../dag';
import { ExecutionContext } from '../../context';
export declare class AnalysisWorker implements Worker {
    execute(task: ExecutionTask, ctx: ExecutionContext): Promise<any>;
    verify(_task: ExecutionTask, ctx: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=analysis.d.ts.map