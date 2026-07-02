export interface ModelMetadata {
    id: string;
    providerId: string;
    contextLimit: number;
    inputCostPer1K: number;
    outputCostPer1K: number;
    capabilities: string[];
}
export interface ProviderMetadata {
    id: string;
    name: string;
    apiKey?: string;
    endpoint?: string;
}
export declare class ModelRegistry {
    private models;
    private providers;
    registerProvider(provider: ProviderMetadata): void;
    registerModel(model: ModelMetadata): void;
    getModel(id: string): ModelMetadata | undefined;
    getModels(): ModelMetadata[];
    clear(): void;
}
//# sourceMappingURL=registry.d.ts.map