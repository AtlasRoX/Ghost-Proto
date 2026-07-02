import * as fs from 'fs';
import * as path from 'path';
import { AuditObjective } from '../../core/compiler/runtime/agent/roles/interface';

export class ObjectiveLoader {
  public static loadFromFile(filePath: string): AuditObjective {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Objective file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as AuditObjective;
  }

  public static loadPreset(presetName: 'security' | 'performance'): AuditObjective {
    const presetPath = path.join(__dirname, '../objectives', `${presetName}.json`);
    return this.loadFromFile(presetPath);
  }
}
