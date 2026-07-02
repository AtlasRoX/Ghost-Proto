"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisQueryEngine = void 0;
const planner_1 = require("./planner");
class AnalysisQueryEngine {
    constructor(executor) {
        this.executor = executor;
        this.planner = new planner_1.AnalysisQueryPlanner();
    }
    async query(intent) {
        const plan = this.planner.plan(intent);
        const results = await this.executor.execute(plan);
        return results.length === 1 ? results[0] : results;
    }
}
exports.AnalysisQueryEngine = AnalysisQueryEngine;
//# sourceMappingURL=engine.js.map