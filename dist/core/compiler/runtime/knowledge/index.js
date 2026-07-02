"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBase = void 0;
class KnowledgeBase {
    constructor() {
        this.history = [];
        this.architecturalBaselines = new Map();
    }
    recordAudit(findings) {
        this.history.push({
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            findings
        });
    }
    setBaselineMetric(metric, value) {
        this.architecturalBaselines.set(metric, value);
    }
    getBaselineMetric(metric) {
        return this.architecturalBaselines.get(metric);
    }
    clear() {
        this.history = [];
        this.architecturalBaselines.clear();
    }
}
exports.KnowledgeBase = KnowledgeBase;
//# sourceMappingURL=index.js.map