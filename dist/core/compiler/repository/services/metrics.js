"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
class MetricsService {
    constructor(index) {
        this.index = index;
    }
    getMetrics() {
        return this.index.getMetrics();
    }
}
exports.MetricsService = MetricsService;
//# sourceMappingURL=metrics.js.map