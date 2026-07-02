"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyParser = void 0;
class PolicyParser {
    static parse(configStr) {
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
        }
        catch {
            // Return a default config if JSON is malformed
            return {
                name: 'Fallback Compliance Policy',
                requiredRulePacks: [],
                forbiddenDependencies: []
            };
        }
    }
}
exports.PolicyParser = PolicyParser;
//# sourceMappingURL=parser.js.map