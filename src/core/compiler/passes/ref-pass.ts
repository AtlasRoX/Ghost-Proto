import { CompilerPass } from '../manager';
import { CompilerContext } from '../context';
import { IRNode, IRSymbol } from '../schema/nodes';
import { ImmutableIRBuilder } from '../model/builder';

export class ReferencePass implements CompilerPass {
  public name = 'ReferencePass';
  public dependencies: string[] = ['ScopePass', 'ImportPass'];
  public invalidates: string[] = [];
  public parallelizable = true;

  public async execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]> {
    const nextIr = [...ir];

    // Collect defined symbols
    const symbols = nextIr.filter(n => n.kind === 'Symbol') as IRSymbol[];
    const moduleSymbols = symbols.filter(s => s.symbolKind === 'Module');
    const functionSymbols = symbols.filter(s => s.symbolKind === 'Function');

    // Automatically draw edges linking functions to their parent modules
    for (const func of functionSymbols) {
      const parent = moduleSymbols.find(m => func.parentFqn === m.fqn);
      if (parent) {
        const edge = ImmutableIRBuilder.createEdge(
          'OWNS',
          parent.id,
          func.id,
          func.span,
          func.origin
        );
        nextIr.push(edge);
      }
    }

    return nextIr;
  }
}
