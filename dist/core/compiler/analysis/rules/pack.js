"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulePack = void 0;
class RulePack {
    constructor(metadata, rules) {
        this.metadata = metadata;
        this.rules = rules;
    }
    validatePrerequisites(availableCapabilities) {
        const missing = this.metadata.capabilities.filter(cap => !availableCapabilities.includes(cap));
        return {
            valid: missing.length === 0,
            missing
        };
    }
}
exports.RulePack = RulePack;
//# sourceMappingURL=pack.js.map