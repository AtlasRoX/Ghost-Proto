import { StorageProvider } from './provider';
export declare class MemoryStorageProvider implements StorageProvider {
    private db;
    private transactionDb;
    initialize(_dbPath: string): Promise<void>;
    private getFullKey;
    put(prefix: string, key: string, value: Buffer): Promise<void>;
    get(prefix: string, key: string): Promise<Buffer | null>;
    delete(prefix: string, key: string): Promise<void>;
    queryPrefix(prefix: string, keyPrefix: string): AsyncIterable<[string, Buffer]>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    writeBatch(batch: {
        type: 'put' | 'del';
        prefix: string;
        key: string;
        value?: Buffer;
    }[]): Promise<void>;
    compact(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map