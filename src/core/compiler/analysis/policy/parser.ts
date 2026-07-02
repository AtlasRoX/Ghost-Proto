export interface CompliancePolicy {
  name: string;
  failOnSeverity?: 'high' | 'medium' | 'low' | 'info';
  requiredRulePacks: string[];
  forbiddenDependencies: string[];
  complexityLimits?: {
    cyclomatic?: number;
  };
}

export class PolicyParser {
  public static parse(configStr: string): CompliancePolicy {
    // Standard JSON config parsing
    try {
      const parsed = JSON.parse(configStr);
      return {
        name: parsed.name || 'Default Compliance Policy',
        failOnSeverity: parsed.failOnSeverity,
        requiredRulePacks: parsed.requiredRulePacks || [],
        forbiddenDependencies: parsed.forbiddenDependencies || [],
        complexityLimits: parsed.complexityLimits
      };
    } catch {
      // Return a default config if JSON is malformed
      return {
        name: 'Fallback Compliance Policy',
        requiredRulePacks: [],
        forbiddenDependencies: []
      };
    }
  }
}
