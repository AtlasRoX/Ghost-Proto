import { ModelRegistry, ModelMetadata } from './registry';
export declare class CapabilityMatcher {
    private registry;
    constructor(registry: ModelRegistry);
    match(requiredCapabilities: string[]): ModelMetadata | null;
}
//# sourceMappingURL=matcher.d.ts.map