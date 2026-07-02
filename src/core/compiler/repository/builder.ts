import { RepositoryIndex } from './index';
import { IRNode, IRSymbol } from '../schema/nodes';
import { IREdge } from '../schema/edges';

export class RepositoryBuilder {
  public static build(compilationUnits: IRNode[][]): RepositoryIndex {
    const index = new RepositoryIndex();

    for (const unit of compilationUnits) {
      for (const node of unit) {
        if (node.kind === 'Symbol') {
          index.addSymbol(node as IRSymbol);
        } else if (node.kind === 'Edge') {
          index.edges.push(node as IREdge);
        }
      }
    }

    // Cross-file reference resolution
    this.resolveCrossFileReferences(index);

    return index;
  }

  private static resolveCrossFileReferences(index: RepositoryIndex): void {
    const symbols = Array.from(index.symbols.values());
    const imports = symbols.filter(s => s.symbolKind === 'Variable' && s.metadata.isImport);

    for (const imp of imports) {
      const resolvedPath = imp.metadata.resolvedPath as string;
      if (resolvedPath) {
        // Resolve import to a target Module in the index
        const targetModule = index.getSymbol(resolvedPath);
        if (targetModule) {
          imp.metadata.targetSymbolId = targetModule.id;
        }
      }
    }
  }
}
