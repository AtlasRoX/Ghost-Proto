"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionDAG = void 0;
class ExecutionDAG {
    constructor() {
        this.tasks = new Map();
    }
    addTask(task) {
        this.tasks.set(task.id, task);
    }
    validate() {
        // Detect cycles using DFS coloring (0 = unvisited, 1 = visiting, 2 = visited)
        const visited = new Map();
        const dfs = (taskId) => {
            visited.set(taskId, 1);
            const task = this.tasks.get(taskId);
            if (task) {
                for (const depId of task.dependencies) {
                    const state = visited.get(depId) ?? 0;
                    if (state === 1)
                        return true; // Cycle detected
                    if (state === 0) {
                        if (dfs(depId))
                            return true;
                    }
                }
            }
            visited.set(taskId, 2);
            return false;
        };
        for (const taskId of this.tasks.keys()) {
            if ((visited.get(taskId) ?? 0) === 0) {
                if (dfs(taskId))
                    return false;
            }
        }
        return true;
    }
    getSortedTasks() {
        const sorted = [];
        const visited = new Set();
        const visit = (taskId) => {
            if (visited.has(taskId))
                return;
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
exports.ExecutionDAG = ExecutionDAG;
//# sourceMappingURL=dag.js.map