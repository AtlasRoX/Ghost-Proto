export declare class SessionMemory {
    private config;
    private featureFlags;
    set(key: string, value: any): void;
    get<T>(key: string): T | undefined;
    enableFeature(flag: string): void;
    isFeatureEnabled(flag: string): boolean;
    clear(): void;
}
//# sourceMappingURL=session.d.ts.map