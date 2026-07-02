import { CompilerContext } from './context';
import { IRNode } from './schema/nodes';
export interface CompilerPass {
    name: string;
    dependencies: string[];
    invalidates: string[];
    parallelizable: boolean;
    execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]>;
}
export declare class PassManager {
    private passes;
    registerPass(pass: CompilerPass): void;
    getPassSchedule(): string[];
    executePipeline(ctx: CompilerContext, initialIr: IRNode[]): Promise<IRNode[]>;
}
//# sourceMappingURL=manager.d.ts.map