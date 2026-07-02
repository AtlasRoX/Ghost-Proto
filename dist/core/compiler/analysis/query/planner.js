"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisQueryPlanner = void 0;
class AnalysisQueryPlanner {
    plan(intent) {
        const steps = [];
        if (intent.action === 'NavigateDefinition') {
            steps.push({
                service: 'navigation',
                method: 'findDefinition',
                args: [intent.params.symbolFqn]
            });
        }
        else if (intent.action === 'TraceCallers') {
            steps.push({
                service: 'navigation',
                method: 'findCallers',
                args: [intent.params.funcFqn]
            });
        }
        else if (intent.action === 'TraceTaint') {
            steps.push({
                service: 'trace',
                method: 'traceTaint',
                args: [intent.params.funcFqn, intent.params.sources, intent.params.sinks]
            });
        }
        return { steps };
    }
}
exports.AnalysisQueryPlanner = AnalysisQueryPlanner;
//# sourceMappingURL=planner.js.map