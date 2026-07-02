export interface SubTaskState {
    id: string;
    name: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
}
export declare class WorkingMemory {
    currentTask: string | null;
    completedSteps: string[];
    subTasks: SubTaskState[];
    localVariables: Map<string, any>;
    setTask(task: string): void;
    completeStep(step: string): void;
    addSubTask(id: string, name: string): void;
    updateSubTaskStatus(id: string, status: SubTaskState['status']): void;
    clear(): void;
}
//# sourceMappingURL=working.d.ts.map