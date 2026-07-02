"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPlannerRole = void 0;
class DefaultPlannerRole {
    async plan(objective, _ctx) {
        return [
            {
                id: 'task_worker_run',
                name: `Analyze ${objective.category}`,
                workerType: 'rule',
                payload: { rulePacks: objective.rulePacks },
                dependencies: [],
                retries: 1,
                timeoutMs: 5000
            }
        ];
    }
}
exports.DefaultPlannerRole = DefaultPlannerRole;
//# sourceMappingURL=planner.js.map