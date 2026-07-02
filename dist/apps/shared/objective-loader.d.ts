import { AuditObjective } from '../../core/compiler/runtime/agent/roles/interface';
export declare class ObjectiveLoader {
    static loadFromFile(filePath: string): AuditObjective;
    static loadPreset(presetName: 'security' | 'performance'): AuditObjective;
}
//# sourceMappingURL=objective-loader.d.ts.map