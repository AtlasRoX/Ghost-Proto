"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetManager = void 0;
class BudgetManager {
    constructor(maxCostLimit = 1.0) {
        this.totalCost = 0;
        this.maxCostLimit = maxCostLimit;
    }
    recordUsage(model, inputTokens, outputTokens) {
        const inputCost = (inputTokens / 1000) * model.inputCostPer1K;
        const outputCost = (outputTokens / 1000) * model.outputCostPer1K;
        this.totalCost += inputCost + outputCost;
        if (this.totalCost > this.maxCostLimit) {
            throw new Error(`Inference budget exceeded: $${this.totalCost.toFixed(4)} spent (Limit: $${this.maxCostLimit.toFixed(4)})`);
        }
    }
    getCost() {
        return this.totalCost;
    }
    getLimit() {
        return this.maxCostLimit;
    }
}
exports.BudgetManager = BudgetManager;
//# sourceMappingURL=budget.js.map