import { Rule } from './types';
export interface RulePackMetadata {
    id: string;
    version: string;
    depends: string[];
    capabilities: string[];
}
export declare class RulePack {
    readonly metadata: RulePackMetadata;
    readonly rules: Rule[];
    constructor(metadata: RulePackMetadata, rules: Rule[]);
    validatePrerequisites(availableCapabilities: string[]): {
        valid: boolean;
        missing: string[];
    };
}
//# sourceMappingURL=pack.d.ts.map