"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptResolver = void 0;
const module_resolver_1 = require("../../module-resolver");
class TypeScriptResolver {
    constructor() {
        this.resolver = new module_resolver_1.NodeModuleResolver();
    }
    resolveImports(ctx, ir, file) {
        for (const node of ir) {
            if (node.kind === 'Symbol') {
                const sym = node;
                if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
                    const importPath = sym.metadata.importPath;
                    const resolved = this.resolver.resolve(importPath, file, ctx.projectRoot);
                    if (resolved) {
                        sym.metadata.resolvedPath = resolved;
                    }
                }
            }
        }
    }
}
exports.TypeScriptResolver = TypeScriptResolver;
//# sourceMappingURL=resolver.js.map