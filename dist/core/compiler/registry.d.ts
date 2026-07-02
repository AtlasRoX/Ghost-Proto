import { CompilerContext } from './context';
import { IRNode } from './schema/nodes';
export interface IRCapability {
    name: string;
    version: number;
    experimental: boolean;
}
export interface LanguageAdapter {
    languageId: string;
    extensions: string[];
    capabilities: string[];
    compile(ctx: CompilerContext, source: string, filePath: string): Promise<IRNode[]>;
}
export declare class LanguageRegistry {
    private adapters;
    private capabilities;
    registerCapability(cap: IRCapability): void;
    registerAdapter(adapter: LanguageAdapter): void;
    getAdapterForExtension(ext: string): LanguageAdapter | undefined;
    getCapability(name: string): IRCapability | undefined;
}
//# sourceMappingURL=registry.d.ts.map