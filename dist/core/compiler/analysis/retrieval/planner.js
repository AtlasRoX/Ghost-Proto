"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalPlanner = void 0;
class RetrievalPlanner {
    plan(intent) {
        const steps = [];
        // Step 1: Fetch target symbols
        steps.push({
            action: 'FetchSymbols',
            args: [intent.symbolFqns]
        });
        // Step 2: Fetch findings related to target files
        steps.push({
            action: 'FetchFindings',
            args: [intent.filePaths]
        });
        // Step 3: Fetch import/dependency paths
        steps.push({
            action: 'FetchPaths',
            args: [intent.filePaths]
        });
        return { steps };
    }
}
exports.RetrievalPlanner = RetrievalPlanner;
//# sourceMappingURL=planner.js.map