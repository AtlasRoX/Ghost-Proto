"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorageProvider = void 0;
class MemoryStorageProvider {
    constructor() {
        this.db = new Map(); // "prefix:key" -> value
        this.transactionDb = null;
    }
    async initialize(_dbPath) { }
    getFullKey(prefix, key) {
        return `${prefix}:${key}`;
    }
    async put(prefix, key, value) {
        const fullKey = this.getFullKey(prefix, key);
        if (this.transactionDb) {
            this.transactionDb.set(fullKey, value);
        }
        else {
            this.db.set(fullKey, value);
        }
    }
    async get(prefix, key) {
        const fullKey = this.getFullKey(prefix, key);
        const map = this.transactionDb || this.db;
        return map.get(fullKey) || null;
    }
    async delete(prefix, key) {
        const fullKey = this.getFullKey(prefix, key);
        if (this.transactionDb) {
            this.transactionDb.delete(fullKey);
        }
        else {
            this.db.delete(fullKey);
        }
    }
    async *queryPrefix(prefix, keyPrefix) {
        const map = this.transactionDb || this.db;
        const prefixString = `${prefix}:${keyPrefix}`;
        for (const [fullKey, value] of map.entries()) {
            if (fullKey.startsWith(prefixString)) {
                const key = fullKey.substring(prefix.length + 1);
                yield [key, value];
            }
        }
    }
    async beginTransaction() {
        this.transactionDb = new Map(this.db);
    }
    async commitTransaction() {
        if (this.transactionDb) {
            this.db = this.transactionDb;
            this.transactionDb = null;
        }
    }
    async rollbackTransaction() {
        this.transactionDb = null;
    }
    async writeBatch(batch) {
        for (const op of batch) {
            if (op.type === 'put' && op.value) {
                await this.put(op.prefix, op.key, op.value);
            }
            else if (op.type === 'del') {
                await this.delete(op.prefix, op.key);
            }
        }
    }
    async compact() { }
    async close() {
        this.db.clear();
        this.transactionDb = null;
    }
}
exports.MemoryStorageProvider = MemoryStorageProvider;
//# sourceMappingURL=memory.js.map