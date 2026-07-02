"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteStorageProvider = void 0;
const memory_1 = require("./memory");
class SQLiteStorageProvider {
    constructor() {
        this.fallback = new memory_1.MemoryStorageProvider();
        this.dbPath = ':memory:';
    }
    async initialize(dbPath) {
        this.dbPath = dbPath;
        await this.fallback.initialize(dbPath);
    }
    async put(prefix, key, value) {
        await this.fallback.put(prefix, key, value);
    }
    async get(prefix, key) {
        return this.fallback.get(prefix, key);
    }
    async delete(prefix, key) {
        await this.fallback.delete(prefix, key);
    }
    async *queryPrefix(prefix, keyPrefix) {
        yield* this.fallback.queryPrefix(prefix, keyPrefix);
    }
    async beginTransaction() {
        await this.fallback.beginTransaction();
    }
    async commitTransaction() {
        await this.fallback.commitTransaction();
    }
    async rollbackTransaction() {
        await this.fallback.rollbackTransaction();
    }
    async writeBatch(batch) {
        await this.fallback.writeBatch(batch);
    }
    async compact() {
        await this.fallback.compact();
    }
    async close() {
        await this.fallback.close();
    }
}
exports.SQLiteStorageProvider = SQLiteStorageProvider;
//# sourceMappingURL=sqlite.js.map