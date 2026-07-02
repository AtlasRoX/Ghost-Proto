import { ObjectiveLoader } from '../shared/objective-loader';
import { ApplicationRunner } from '../shared/runner';
import { ReportWriter } from '../shared/report-writer';
import { IRSymbol } from '../../core/compiler/schema/nodes';

export interface CLIOptions {
  objectivePreset?: 'security' | 'performance';
  objectivePath?: string;
  outputPath?: string;
}

export class CLIAdapter {
  public static async run(options: CLIOptions, compilationUnits: IRSymbol[][]): Promise<number> {
    try {
      let objective;
      if (options.objectivePath) {
        objective = ObjectiveLoader.loadFromFile(options.objectivePath);
      } else if (options.objectivePreset) {
        objective = ObjectiveLoader.loadPreset(options.objectivePreset);
      } else {
        objective = ObjectiveLoader.loadPreset('security');
      }

      const report = await ApplicationRunner.runAudit(objective, compilationUnits);

      if (options.outputPath) {
        ReportWriter.write(options.outputPath, report);
      }

      return 0; // Success code
    } catch (e: any) {
      console.error(`CLI execution failed: ${e.message}`);
      return 1; // Error code
    }
  }
}
