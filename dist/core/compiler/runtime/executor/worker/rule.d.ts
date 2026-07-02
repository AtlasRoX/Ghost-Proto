import { Worker } from './types';
import { ExecutionTask } from '../dag';
import { ExecutionContext } from '../../context';
export declare class RuleWorker implements Worker {
    execute(task: ExecutionTask, ctx: ExecutionContext): Promise<any>;
    verify(task: ExecutionTask, ctx: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=rule.d.ts.map