export interface CacheEntry<T> {
    value: T;
    createdAt: number;
    ttlMs: number;
}
export declare class MemoryPolicies {
    private cache;
    set<T>(key: string, value: T, ttlMs?: number): void;
    get<T>(key: string): T | null;
    evictExpired(): void;
    clear(): void;
}
//# sourceMappingURL=policy.d.ts.map