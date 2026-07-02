"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalEngine = void 0;
const planner_1 = require("./planner");
const executor_1 = require("./executor");
class RetrievalEngine {
    constructor(ctx) {
        this.planner = new planner_1.RetrievalPlanner();
        this.executor = new executor_1.RetrievalExecutor(ctx);
    }
    async retrieve(intent) {
        const plan = this.planner.plan(intent);
        return this.executor.execute(plan);
    }
}
exports.RetrievalEngine = RetrievalEngine;
//# sourceMappingURL=index.js.map