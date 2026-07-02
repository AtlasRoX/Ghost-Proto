import { CompilerPass } from '../manager';
import { CompilerContext } from '../context';
import { IRNode } from '../schema/nodes';
export declare class ReferencePass implements CompilerPass {
    name: string;
    dependencies: string[];
    invalidates: string[];
    parallelizable: boolean;
    execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]>;
}
//# sourceMappingURL=ref-pass.d.ts.map