"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPipeline = void 0;
const planner_1 = require("./planner");
const optimizer_1 = require("./optimizer");
class QueryPipeline {
    constructor(executor) {
        this.executor = executor;
        this.planner = new planner_1.QueryPlanner();
        this.optimizer = new optimizer_1.QueryOptimizer();
    }
    async query(intent) {
        const rawPlan = this.planner.plan(intent);
        const optimizedPlan = this.optimizer.optimize(rawPlan);
        const results = await this.executor.execute(optimizedPlan);
        return results.length === 1 ? results[0] : results;
    }
}
exports.QueryPipeline = QueryPipeline;
//# sourceMappingURL=pipeline.js.map