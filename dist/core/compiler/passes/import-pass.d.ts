import { CompilerPass } from '../manager';
import { CompilerContext } from '../context';
import { IRNode } from '../schema/nodes';
export declare class ImportPass implements CompilerPass {
    name: string;
    dependencies: string[];
    invalidates: string[];
    parallelizable: boolean;
    execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]>;
}
//# sourceMappingURL=import-pass.d.ts.map