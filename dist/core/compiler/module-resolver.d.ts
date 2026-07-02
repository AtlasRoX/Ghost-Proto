export interface ModuleResolver {
    resolve(importPath: string, containingFile: string, projectRoot: string): string | null;
}
export declare class NodeModuleResolver implements ModuleResolver {
    resolve(importPath: string, containingFile: string, projectRoot: string): string | null;
}
//# sourceMappingURL=module-resolver.d.ts.map