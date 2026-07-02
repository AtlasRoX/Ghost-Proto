"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRegistry = void 0;
class ModelRegistry {
    constructor() {
        this.models = new Map();
        this.providers = new Map();
    }
    registerProvider(provider) {
        this.providers.set(provider.id, provider);
    }
    registerModel(model) {
        this.models.set(model.id, model);
    }
    getModel(id) {
        return this.models.get(id);
    }
    getModels() {
        return Array.from(this.models.values());
    }
    clear() {
        this.models.clear();
        this.providers.clear();
    }
}
exports.ModelRegistry = ModelRegistry;
//# sourceMappingURL=registry.js.map