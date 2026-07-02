import { IRSymbol } from '../../core/compiler/schema/nodes';
export interface CLIOptions {
    objectivePreset?: 'security' | 'performance';
    objectivePath?: string;
    outputPath?: string;
}
export declare class CLIAdapter {
    static run(options: CLIOptions, compilationUnits: IRSymbol[][]): Promise<number>;
}
//# sourceMappingURL=index.d.ts.map