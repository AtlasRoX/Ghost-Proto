"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIAdapter = void 0;
const objective_loader_1 = require("../shared/objective-loader");
const runner_1 = require("../shared/runner");
const report_writer_1 = require("../shared/report-writer");
class CLIAdapter {
    static async run(options, compilationUnits) {
        try {
            let objective;
            if (options.objectivePath) {
                objective = objective_loader_1.ObjectiveLoader.loadFromFile(options.objectivePath);
            }
            else if (options.objectivePreset) {
                objective = objective_loader_1.ObjectiveLoader.loadPreset(options.objectivePreset);
            }
            else {
                objective = objective_loader_1.ObjectiveLoader.loadPreset('security');
            }
            const report = await runner_1.ApplicationRunner.runAudit(objective, compilationUnits);
            if (options.outputPath) {
                report_writer_1.ReportWriter.write(options.outputPath, report);
            }
            return 0; // Success code
        }
        catch (e) {
            console.error(`CLI execution failed: ${e.message}`);
            return 1; // Error code
        }
    }
}
exports.CLIAdapter = CLIAdapter;
//# sourceMappingURL=index.js.map