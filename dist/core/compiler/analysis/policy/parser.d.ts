export interface CompliancePolicy {
    name: string;
    failOnSeverity?: 'high' | 'medium' | 'low' | 'info';
    requiredRulePacks: string[];
    forbiddenDependencies: string[];
    complexityLimits?: {
        cyclomatic?: number;
    };
}
export declare class PolicyParser {
    static parse(configStr: string): CompliancePolicy;
}
//# sourceMappingURL=parser.d.ts.map