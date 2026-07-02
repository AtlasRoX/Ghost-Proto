"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageRegistry = void 0;
class LanguageRegistry {
    constructor() {
        this.adapters = new Map();
        this.capabilities = new Map();
    }
    registerCapability(cap) {
        this.capabilities.set(cap.name, cap);
    }
    registerAdapter(adapter) {
        this.adapters.set(adapter.languageId, adapter);
    }
    getAdapterForExtension(ext) {
        for (const adapter of this.adapters.values()) {
            if (adapter.extensions.includes(ext)) {
                return adapter;
            }
        }
        return undefined;
    }
    getCapability(name) {
        return this.capabilities.get(name);
    }
}
exports.LanguageRegistry = LanguageRegistry;
//# sourceMappingURL=registry.js.map