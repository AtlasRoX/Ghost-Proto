export interface ExecutionTask {
    id: string;
    name: string;
    workerType: 'rule' | 'analysis';
    payload: Record<string, any>;
    dependencies: string[];
    retries: number;
    timeoutMs: number;
}
export declare class ExecutionDAG {
    tasks: Map<string, ExecutionTask>;
    addTask(task: ExecutionTask): void;
    validate(): boolean;
    getSortedTasks(): ExecutionTask[];
}
//# sourceMappingURL=dag.d.ts.map