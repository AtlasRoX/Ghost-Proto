"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationRunner = void 0;
const builder_1 = require("../../core/compiler/repository/builder");
const context_1 = require("../../core/compiler/repository/context");
const context_2 = require("../../core/compiler/analysis/context");
const context_3 = require("../../core/compiler/runtime/context");
const coordinator_1 = require("../../core/compiler/runtime/agent/coordinator");
class ApplicationRunner {
    static async runAudit(objective, compilationUnits) {
        const index = builder_1.RepositoryBuilder.build(compilationUnits);
        const repoCtx = new context_1.RepositoryContext(index);
        const analysisCtx = new context_2.AnalysisContext(repoCtx);
        const execCtx = new context_3.ExecutionContext(repoCtx, analysisCtx);
        const coordinator = new coordinator_1.AgentCoordinator();
        const report = await coordinator.run(objective, execCtx);
        // Dispose context to free up memories
        execCtx.dispose();
        return report;
    }
}
exports.ApplicationRunner = ApplicationRunner;
//# sourceMappingURL=runner.js.map