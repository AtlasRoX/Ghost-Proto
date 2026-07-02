import { ExecutionContext } from '../../context';
import { ExecutionTask } from '../dag';

export interface Worker {
  execute(task: ExecutionTask, ctx: ExecutionContext): Promise<any>;
  verify(task: ExecutionTask, ctx: ExecutionContext): Promise<boolean>;
}
