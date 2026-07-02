import { CompilerContext } from '../../context';
export interface SemanticNode {
    type: string;
    name: string;
    fqn: string;
    span: {
        start: {
            offset: number;
            line: number;
            column: number;
        };
        end: {
            offset: number;
            line: number;
            column: number;
        };
    };
    children: SemanticNode[];
    metadata: Record<string, unknown>;
}
export declare class TypeScriptParser {
    private parser;
    private wasmLoaded;
    initialize(wasmPath?: string): Promise<void>;
    parse(ctx: CompilerContext, source: string, filePath: string): SemanticNode;
    private mapTreeSitterToSemanticNode;
    private fallbackParse;
}
//# sourceMappingURL=parser.d.ts.map