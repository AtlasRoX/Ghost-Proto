import { RepositoryContext } from '../../repository/context';

export class DependencyTracer {
  constructor(private repo: RepositoryContext) {}

  public traceDependencyChain(fromFile: string, toFile: string): string[] | null {
    // DFS/BFS path finding through the imports index
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (curr: string): boolean => {
      visited.add(curr);
      path.push(curr);

      if (curr === toFile) {
        return true;
      }

      // Get outbound imports of curr
      const imports = Array.from(this.repo.index.symbols.values()).filter(
        s => s.span?.file === curr && s.symbolKind === 'Variable' && s.metadata.isImport
      );

      for (const imp of imports) {
        const resolved = imp.metadata.resolvedPath as string;
        if (resolved && !visited.has(resolved)) {
          if (dfs(resolved)) {
            return true;
          }
        }
      }

      path.pop();
      return false;
    };

    if (dfs(fromFile)) {
      return path;
    }
    return null;
  }
}
