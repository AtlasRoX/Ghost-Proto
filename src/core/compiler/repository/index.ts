import { IRSymbol } from '../schema/nodes';
import { IREdge } from '../schema/edges';

export interface RepositoryMetrics {
  symbolCount: number;
  moduleCount: number;
  importCount: number;
  referenceCount: number;
}

export class RepositoryIndex {
  public symbols = new Map<string, IRSymbol>(); // FQN -> Symbol
  public edges: IREdge[] = [];
  public filePaths = new Set<string>();

  public addSymbol(sym: IRSymbol): void {
    this.symbols.set(sym.fqn, sym);
    if (sym.span?.file) {
      this.filePaths.add(sym.span.file);
    }
  }

  public getSymbol(fqn: string): IRSymbol | undefined {
    return this.symbols.get(fqn);
  }

  public getMetrics(): RepositoryMetrics {
    const symbolCount = this.symbols.size;
    const moduleCount = Array.from(this.symbols.values()).filter(s => s.symbolKind === 'Module').length;
    const importCount = Array.from(this.symbols.values()).filter(s => s.symbolKind === 'Variable' && s.metadata.isImport).length;
    const referenceCount = this.edges.length;

    return {
      symbolCount,
      moduleCount,
      importCount,
      referenceCount
    };
  }

  public diff(other: RepositoryIndex): { added: string[]; deleted: string[]; modified: string[] } {
    const added: string[] = [];
    const deleted: string[] = [];
    const modified: string[] = [];

    // Compare this index (new) against other index (old/parent)
    for (const [fqn, sym] of this.symbols.entries()) {
      const oldSym = other.getSymbol(fqn);
      if (!oldSym) {
        added.push(fqn);
      } else if (sym.id !== oldSym.id) {
        modified.push(fqn);
      }
    }

    for (const fqn of other.symbols.keys()) {
      if (!this.symbols.has(fqn)) {
        deleted.push(fqn);
      }
    }

    return { added, deleted, modified };
  }
}
