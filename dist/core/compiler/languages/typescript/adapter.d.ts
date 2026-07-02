import { LanguageAdapter } from '../../registry';
import { CompilerContext } from '../../context';
import { IRNode } from '../../schema/nodes';
export declare class TypeScriptLanguageAdapter implements LanguageAdapter {
    languageId: string;
    extensions: string[];
    capabilities: string[];
    private parser;
    private mapper;
    private resolver;
    private initialized;
    compile(ctx: CompilerContext, source: string, filePath: string): Promise<IRNode[]>;
}
//# sourceMappingURL=adapter.d.ts.map