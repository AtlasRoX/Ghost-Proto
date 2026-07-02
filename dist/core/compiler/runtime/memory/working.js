"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingMemory = void 0;
class WorkingMemory {
    constructor() {
        this.currentTask = null;
        this.completedSteps = [];
        this.subTasks = [];
        this.localVariables = new Map();
    }
    setTask(task) {
        this.currentTask = task;
    }
    completeStep(step) {
        this.completedSteps.push(step);
    }
    addSubTask(id, name) {
        this.subTasks.push({ id, name, status: 'pending' });
    }
    updateSubTaskStatus(id, status) {
        const task = this.subTasks.find(t => t.id === id);
        if (task) {
            task.status = status;
        }
    }
    clear() {
        this.currentTask = null;
        this.completedSteps = [];
        this.subTasks = [];
        this.localVariables.clear();
    }
}
exports.WorkingMemory = WorkingMemory;
//# sourceMappingURL=working.js.map