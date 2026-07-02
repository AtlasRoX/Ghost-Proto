import { IRSymbol } from '../../schema/nodes';
export interface CFGBlock {
    id: string;
    label: string;
    statements: string[];
    successors: string[];
    predecessors: string[];
}
export interface CFG {
    entryBlockId: string;
    blocks: Map<string, CFGBlock>;
}
export declare class CFGBuilder {
    static build(func: IRSymbol): CFG;
}
//# sourceMappingURL=cfg.d.ts.map