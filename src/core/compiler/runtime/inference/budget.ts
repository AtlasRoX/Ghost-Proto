import { ModelMetadata } from './registry';

export class BudgetManager {
  private totalCost = 0;
  private maxCostLimit: number;

  constructor(maxCostLimit = 1.0) {
    this.maxCostLimit = maxCostLimit;
  }

  public recordUsage(model: ModelMetadata, inputTokens: number, outputTokens: number): void {
    const inputCost = (inputTokens / 1000) * model.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1K;
    this.totalCost += inputCost + outputCost;

    if (this.totalCost > this.maxCostLimit) {
      throw new Error(`Inference budget exceeded: $${this.totalCost.toFixed(4)} spent (Limit: $${this.maxCostLimit.toFixed(4)})`);
    }
  }

  public getCost(): number {
    return this.totalCost;
  }

  public getLimit(): number {
    return this.maxCostLimit;
  }
}
