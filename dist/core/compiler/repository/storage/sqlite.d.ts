import { StorageProvider } from './provider';
export declare class SQLiteStorageProvider implements StorageProvider {
    private fallback;
    private dbPath;
    initialize(dbPath: string): Promise<void>;
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
//# sourceMappingURL=sqlite.d.ts.map