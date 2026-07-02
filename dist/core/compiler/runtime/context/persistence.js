"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryPersistenceAdapter = void 0;
class MemoryPersistenceAdapter {
    constructor() {
        this.store = new Map();
    }
    async transaction() { }
    async snapshot(name, data) {
        this.store.set(name, data);
    }
    async restore(name) {
        return this.store.get(name) || null;
    }
    async merge(name, data) {
        this.store.set(name, data);
    }
    async compact() { }
}
exports.MemoryPersistenceAdapter = MemoryPersistenceAdapter;
//# sourceMappingURL=persistence.js.map