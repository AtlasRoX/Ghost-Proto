export interface PersistenceAdapter {
    transaction(): Promise<void>;
    snapshot(name: string, data: Buffer): Promise<void>;
    restore(name: string): Promise<Buffer | null>;
    merge(name: string, data: Buffer): Promise<void>;
    compact(): Promise<void>;
}
export declare class MemoryPersistenceAdapter implements PersistenceAdapter {
    private store;
    transaction(): Promise<void>;
    snapshot(name: string, data: Buffer): Promise<void>;
    restore(name: string): Promise<Buffer | null>;
    merge(name: string, data: Buffer): Promise<void>;
    compact(): Promise<void>;
}
//# sourceMappingURL=persistence.d.ts.map