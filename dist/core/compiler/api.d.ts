import { Diagnostic } from './context';
import { LanguageAdapter } from './registry';
import { CompilerPass } from './manager';
import { IRNode } from './schema/nodes';
import { IRSerializer } from './model/serializer';
export interface CompilationResult {
    success: boolean;
    ir: IRNode[];
    diagnostics: Diagnostic[];
    serialized: string;
}
export declare class CompilerAPI {
    private registry;
    private passManager;
    private serializer;
    constructor();
    registerLanguage(adapter: LanguageAdapter): void;
    registerPass(pass: CompilerPass): void;
    setSerializer(serializer: IRSerializer): void;
    compileFile(filePath: string, source: string, projectRoot: string, languageId: string): Promise<CompilationResult>;
}
//# sourceMappingURL=api.d.ts.map