import { CompilerPass } from '../manager';
import { CompilerContext } from '../context';
import { IRNode, IRSymbol } from '../schema/nodes';

export class ImportPass implements CompilerPass {
  public name = 'ImportPass';
  public dependencies: string[] = [];
  public invalidates: string[] = [];
  public parallelizable = true;

  public async execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]> {
    const nextIr = [...ir];

    for (const node of nextIr) {
      if (node.kind === 'Symbol') {
        const sym = node as IRSymbol;
        if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
          ctx.emit({
            severity: 'info',
            code: 'INF_IMPORT_RESOLVED',
            message: `Import symbol ${sym.name} evaluated in compilation context.`,
            location: sym.span
          });
        }
      }
    }

    return nextIr;
  }
}
