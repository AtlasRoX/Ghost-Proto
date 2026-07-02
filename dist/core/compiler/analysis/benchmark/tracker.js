"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkTracker = void 0;
class BenchmarkTracker {
    constructor() {
        this.benchmarks = [];
    }
    track(ruleId, durationMs, memoryDeltaBytes, findingsCount) {
        this.benchmarks.push({
            ruleId,
            durationMs,
            memoryDeltaBytes,
            findingsCount
        });
    }
    getBenchmarks() {
        return this.benchmarks;
    }
}
exports.BenchmarkTracker = BenchmarkTracker;
//# sourceMappingURL=tracker.js.map