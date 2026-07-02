import { ModelMetadata } from './registry';
export declare class BudgetManager {
    private totalCost;
    private maxCostLimit;
    constructor(maxCostLimit?: number);
    recordUsage(model: ModelMetadata, inputTokens: number, outputTokens: number): void;
    getCost(): number;
    getLimit(): number;
}
//# sourceMappingURL=budget.d.ts.map