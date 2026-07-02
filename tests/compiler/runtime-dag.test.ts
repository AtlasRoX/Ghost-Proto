import { ExecutionDAG, ExecutionTask } from '../../src/core/compiler/runtime/executor/dag';

describe('Execution DAG', () => {
  it('should validate dependencies and sort tasks topologically', () => {
    const dag = new ExecutionDAG();

    const t1: ExecutionTask = {
      id: 'task1',
      name: 'Task 1',
      workerType: 'analysis',
      payload: {},
      dependencies: [],
      retries: 0,
      timeoutMs: 1000
    };

    const t2: ExecutionTask = {
      id: 'task2',
      name: 'Task 2',
      workerType: 'rule',
      payload: {},
      dependencies: ['task1'], // Task 2 depends on Task 1
      retries: 0,
      timeoutMs: 1000
    };

    dag.addTask(t1);
    dag.addTask(t2);

    expect(dag.validate()).toBe(true);

    const sorted = dag.getSortedTasks();
    expect(sorted).toHaveLength(2);
    expect(sorted[0].id).toBe('task1');
    expect(sorted[1].id).toBe('task2');
  });

  it('should detect cycles and report invalid graphs', () => {
    const dag = new ExecutionDAG();

    const t1: ExecutionTask = {
      id: 'task1',
      name: 'Task 1',
      workerType: 'analysis',
      payload: {},
      dependencies: ['task2'], // Cycle!
      retries: 0,
      timeoutMs: 1000
    };

    const t2: ExecutionTask = {
      id: 'task2',
      name: 'Task 2',
      workerType: 'rule',
      payload: {},
      dependencies: ['task1'],
      retries: 0,
      timeoutMs: 1000
    };

    dag.addTask(t1);
    dag.addTask(t2);

    expect(dag.validate()).toBe(false);
  });
});
