"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryPolicies = void 0;
class MemoryPolicies {
    constructor() {
        this.cache = new Map();
    }
    set(key, value, ttlMs = 60000) {
        this.cache.set(key, {
            value,
            createdAt: Date.now(),
            ttlMs
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const isExpired = Date.now() - entry.createdAt > entry.ttlMs;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.createdAt > entry.ttlMs) {
                this.cache.delete(key);
            }
        }
    }
    clear() {
        this.cache.clear();
    }
}
exports.MemoryPolicies = MemoryPolicies;
//# sourceMappingURL=policy.js.map