import { Rule } from './types';
export declare class RuleRegistry {
    private rules;
    constructor();
    register(rule: Rule): void;
    getRules(): Rule[];
    private registerDefaultRules;
}
//# sourceMappingURL=registry.d.ts.map