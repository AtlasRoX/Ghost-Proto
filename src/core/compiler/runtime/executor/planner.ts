import { ExecutionDAG, ExecutionTask } from './dag';

export class ExecutionPlanner {
  public static plan(objective: string): ExecutionDAG {
    const dag = new ExecutionDAG();

    if (objective === 'AuditSecurity') {
      const task1: ExecutionTask = {
        id: 'task_analysis',
        name: 'Run Dataflow Analysis',
        workerType: 'analysis',
        payload: { filePaths: ['test.ts'], symbolFqns: ['test.ts:processQuery'] },
        dependencies: [],
        retries: 2,
        timeoutMs: 5000
      };

      const task2: ExecutionTask = {
        id: 'task_rules',
        name: 'Execute SQL Injection Rules',
        workerType: 'rule',
        payload: { ruleId: 'GHOST_SQL_INJECTION' },
        dependencies: ['task_analysis'],
        retries: 1,
        timeoutMs: 2000
      };

      dag.addTask(task1);
      dag.addTask(task2);
    }

    return dag;
  }
}
