"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPlanner = void 0;
const dag_1 = require("./dag");
class ExecutionPlanner {
    static plan(objective) {
        const dag = new dag_1.ExecutionDAG();
        if (objective === 'AuditSecurity') {
            const task1 = {
                id: 'task_analysis',
                name: 'Run Dataflow Analysis',
                workerType: 'analysis',
                payload: { filePaths: ['test.ts'], symbolFqns: ['test.ts:processQuery'] },
                dependencies: [],
                retries: 2,
                timeoutMs: 5000
            };
            const task2 = {
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
exports.ExecutionPlanner = ExecutionPlanner;
//# sourceMappingURL=planner.js.map