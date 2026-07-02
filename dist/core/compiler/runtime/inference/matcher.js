"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityMatcher = void 0;
class CapabilityMatcher {
    constructor(registry) {
        this.registry = registry;
    }
    match(requiredCapabilities) {
        const models = this.registry.getModels();
        let bestModel = null;
        for (const model of models) {
            // Check if model supports all required capabilities
            const matchesAll = requiredCapabilities.every(cap => model.capabilities.includes(cap));
            if (matchesAll) {
                if (!bestModel) {
                    bestModel = model;
                }
                else {
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
exports.CapabilityMatcher = CapabilityMatcher;
//# sourceMappingURL=matcher.js.map