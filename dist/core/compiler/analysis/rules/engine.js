"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngine = void 0;
class RuleEngine {
    constructor(registry) {
        this.registry = registry;
    }
    async runAll(ctx) {
        const allObservations = [];
        const rules = this.registry.getRules();
        for (const rule of rules) {
            try {
                const obs = await rule.execute(ctx);
                allObservations.push(...obs);
            }
            catch (e) {
                ctx.diagnostics.push({
                    severity: 'error',
                    code: 'RULE_EXECUTION_FAILED',
                    message: `Rule ${rule.id} failed to execute: ${e.message}`
                });
            }
        }
        return allObservations;
    }
}
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=engine.js.map