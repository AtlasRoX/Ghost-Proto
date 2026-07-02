import { CompilerContext } from '../context';
import { IRNode } from '../schema/nodes';
export declare class GhostIRValidator {
    static validate(ctx: CompilerContext, ir: IRNode[], level: 1 | 2 | 3 | 4): boolean;
    private static validateLevel1;
    private static validateLevel2;
    private static validateLevel3;
    private static validateLevel4;
}
//# sourceMappingURL=validator.d.ts.map