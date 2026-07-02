import { CompilerContext } from '../../context';
import { IRNode, IRSymbol } from '../../schema/nodes';
import { NodeModuleResolver } from '../../module-resolver';

export class TypeScriptResolver {
  private resolver = new NodeModuleResolver();

  public resolveImports(ctx: CompilerContext, ir: IRNode[], file: string): void {
    for (const node of ir) {
      if (node.kind === 'Symbol') {
        const sym = node as IRSymbol;
        if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
          const importPath = sym.metadata.importPath as string;
          const resolved = this.resolver.resolve(importPath, file, ctx.projectRoot);
          if (resolved) {
            sym.metadata.resolvedPath = resolved;
          }
        }
      }
    }
  }
}
