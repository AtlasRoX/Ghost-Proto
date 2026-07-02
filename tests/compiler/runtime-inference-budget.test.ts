import { BudgetManager } from '../../src/core/compiler/runtime/inference/budget';
import { ModelMetadata } from '../../src/core/compiler/runtime/inference/registry';

describe('Inference Budget Manager', () => {
  const model: ModelMetadata = {
    id: 'gpt-4o',
    providerId: 'openai',
    contextLimit: 128000,
    inputCostPer1K: 0.005,
    outputCostPer1K: 0.015,
    capabilities: []
  };

  it('should track cumulative costs and throw error if budget cap is exceeded', () => {
    const budget = new BudgetManager(0.01); // 1 cent limit

    // Should work without throwing
    budget.recordUsage(model, 1000, 200); // Cost: (1 * 0.005) + (0.2 * 0.015) = 0.005 + 0.003 = 0.008
    expect(budget.getCost()).toBeCloseTo(0.008);

    // Recording another call should trigger budget exceeded error
    expect(() => {
      budget.recordUsage(model, 500, 100);
    }).toThrow(/Inference budget exceeded/);
  });
});
