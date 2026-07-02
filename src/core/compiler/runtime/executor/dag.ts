export interface ExecutionTask {
  id: string;
  name: string;
  workerType: 'rule' | 'analysis';
  payload: Record<string, any>;
  dependencies: string[]; // Parent task IDs
  retries: number;
  timeoutMs: number;
}

export class ExecutionDAG {
  public tasks = new Map<string, ExecutionTask>();

  public addTask(task: ExecutionTask): void {
    this.tasks.set(task.id, task);
  }

  public validate(): boolean {
    // Detect cycles using DFS coloring (0 = unvisited, 1 = visiting, 2 = visited)
    const visited = new Map<string, number>();

    const dfs = (taskId: string): boolean => {
      visited.set(taskId, 1);
      const task = this.tasks.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          const state = visited.get(depId) ?? 0;
          if (state === 1) return true; // Cycle detected
          if (state === 0) {
            if (dfs(depId)) return true;
          }
        }
      }
      visited.set(taskId, 2);
      return false;
    };

    for (const taskId of this.tasks.keys()) {
      if ((visited.get(taskId) ?? 0) === 0) {
        if (dfs(taskId)) return false;
      }
    }

    return true;
  }

  public getSortedTasks(): ExecutionTask[] {
    const sorted: ExecutionTask[] = [];
    const visited = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      const task = this.tasks.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          visit(depId);
        }
        visited.add(taskId);
        sorted.push(task);
      }
    };

    for (const taskId of this.tasks.keys()) {
      visit(taskId);
    }

    return sorted;
  }
}
