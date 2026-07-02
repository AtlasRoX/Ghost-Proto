"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMemory = void 0;
class SessionMemory {
    constructor() {
        this.config = new Map();
        this.featureFlags = new Set();
    }
    set(key, value) {
        this.config.set(key, value);
    }
    get(key) {
        return this.config.get(key);
    }
    enableFeature(flag) {
        this.featureFlags.add(flag);
    }
    isFeatureEnabled(flag) {
        return this.featureFlags.has(flag);
    }
    clear() {
        this.config.clear();
        this.featureFlags.clear();
    }
}
exports.SessionMemory = SessionMemory;
//# sourceMappingURL=session.js.map