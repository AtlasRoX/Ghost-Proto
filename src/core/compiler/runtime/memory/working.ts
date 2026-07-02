export interface SubTaskState {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export class WorkingMemory {
  public currentTask: string | null = null;
  public completedSteps: string[] = [];
  public subTasks: SubTaskState[] = [];
  public localVariables = new Map<string, any>();

  public setTask(task: string): void {
    this.currentTask = task;
  }

  public completeStep(step: string): void {
    this.completedSteps.push(step);
  }

  public addSubTask(id: string, name: string): void {
    this.subTasks.push({ id, name, status: 'pending' });
  }

  public updateSubTaskStatus(id: string, status: SubTaskState['status']): void {
    const task = this.subTasks.find(t => t.id === id);
    if (task) {
      task.status = status;
    }
  }

  public clear(): void {
    this.currentTask = null;
    this.completedSteps = [];
    this.subTasks = [];
    this.localVariables.clear();
  }
}
