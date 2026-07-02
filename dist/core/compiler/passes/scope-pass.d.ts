import { CompilerPass } from '../manager';
import { CompilerContext } from '../context';
import { IRNode } from '../schema/nodes';
export declare class ScopePass implements CompilerPass {
    name: string;
    dependencies: string[];
    invalidates: string[];
    parallelizable: boolean;
    execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]>;
}
//# sourceMappingURL=scope-pass.d.ts.map