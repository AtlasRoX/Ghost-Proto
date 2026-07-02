import { ModelRegistry, ModelMetadata } from './registry';

export class CapabilityMatcher {
  constructor(private registry: ModelRegistry) {}

  public match(requiredCapabilities: string[]): ModelMetadata | null {
    const models = this.registry.getModels();
    let bestModel: ModelMetadata | null = null;

    for (const model of models) {
      // Check if model supports all required capabilities
      const matchesAll = requiredCapabilities.every(cap => model.capabilities.includes(cap));
      if (matchesAll) {
        if (!bestModel) {
          bestModel = model;
        } else {
          // Select model with cheaper input cost
          if (model.inputCostPer1K < bestModel.inputCostPer1K) {
            bestModel = model;
          }
        }
      }
    }

    return bestModel;
  }
}
