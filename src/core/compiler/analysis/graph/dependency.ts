import { RepositoryContext } from '../../repository/context';

export interface DependencyEdge {
  fromModule: string;
  toModule: string;
}

export class DependencyGraphBuilder {
  public static build(context: RepositoryContext): DependencyEdge[] {
    const edges: DependencyEdge[] = [];
    const symbols = Array.from(context.index.symbols.values());
    const imports = symbols.filter(s => s.symbolKind === 'Variable' && s.metadata.isImport);

    for (const imp of imports) {
      const resolvedPath = imp.metadata.resolvedPath as string;
      const file = imp.span?.file;
      if (resolvedPath && file) {
        edges.push({
          fromModule: file,
          toModule: resolvedPath
        });
      }
    }

    return edges;
  }
}
