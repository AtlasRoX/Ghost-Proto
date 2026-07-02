import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';

export class DefinitionResolver {
  constructor(private repo: RepositoryContext) {}

  public findDefinition(sym: IRSymbol): IRSymbol | null {
    if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
      const targetId = sym.metadata.targetSymbolId as string;
      if (targetId) {
        const target = Array.from(this.repo.index.symbols.values()).find(s => s.id === targetId);
        return target || null;
      }
    }
    return sym;
  }
}
