import { ExecutionDAG, ExecutionTask } from './dag';
import { ExecutionContext } from '../context';
import { RuleWorker } from './worker/rule';
import { AnalysisWorker } from './worker/analysis';
import { Worker } from './worker/types';

export class ExecutionScheduler {
  private workers: Record<'rule' | 'analysis', Worker> = {
    rule: new RuleWorker(),
    analysis: new AnalysisWorker()
  };

  public async execute(dag: ExecutionDAG, ctx: ExecutionContext): Promise<void> {
    if (!dag.validate()) {
      throw new Error('Execution DAG contains cyclic dependencies.');
    }

    const sortedTasks = dag.getSortedTasks();
    ctx.logEvent('SCHEDULER_START', `Starting execution of ${sortedTasks.length} tasks`);

    for (const task of sortedTasks) {
      const worker = this.workers[task.workerType];
      if (!worker) {
        throw new Error(`No worker found for type: ${task.workerType}`);
      }

      ctx.workingMemory.setTask(task.name);

      let success = false;
      let attempt = 0;
      
      while (attempt <= task.retries && !success) {
        attempt++;
        ctx.logEvent('TASK_ATTEMPT', `Task ${task.id} attempt ${attempt}`);

        try {
          // Wrap execution in a simple timeout promise wrapper
          await Promise.race([
            worker.execute(task, ctx),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Task execution timeout exceeded')), task.timeoutMs)
            )
          ]);

          // Verification gate
          const verified = await worker.verify(task, ctx);
          if (verified) {
            success = true;
            ctx.workingMemory.completeStep(task.name);
            ctx.logEvent('TASK_SUCCESS', `Task ${task.id} verified successfully`);
          } else {
            ctx.logEvent('TASK_VERIFICATION_FAILED', `Verification failed for task ${task.id}`);
          }
        } catch (e: any) {
          ctx.logEvent('TASK_ERROR', `Error in task ${task.id}: ${e.message}`);
        }
      }

      if (!success) {
        ctx.logEvent('SCHEDULER_ABORT', `Execution aborted due to failure in task ${task.id}`);
        throw new Error(`Execution failed at task: ${task.id}`);
      }
    }

    ctx.logEvent('SCHEDULER_COMPLETED', 'All scheduled tasks completed successfully.');
  }
}
