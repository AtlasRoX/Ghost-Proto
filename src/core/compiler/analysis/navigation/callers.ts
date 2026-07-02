import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';

export class CallersTracker {
  constructor(private repo: RepositoryContext) {}

  public findCallers(funcFqn: string): IRSymbol[] {
    const callers: IRSymbol[] = [];
    const symbols = Array.from(this.repo.index.symbols.values());
    const targetFunc = symbols.find(s => s.fqn === funcFqn);
    if (!targetFunc) return [];

    const incomingRefs = this.repo.references.getReferencesTo(targetFunc.id);
    for (const ref of incomingRefs) {
      if (ref.edgeKind === 'CALLS') {
        const caller = symbols.find(s => s.id === ref.fromNodeId);
        if (caller) {
          callers.push(caller);
        }
      }
    }

    return callers;
  }

  public findCallees(funcFqn: string): IRSymbol[] {
    const callees: IRSymbol[] = [];
    const symbols = Array.from(this.repo.index.symbols.values());
    const targetFunc = symbols.find(s => s.fqn === funcFqn);
    if (!targetFunc) return [];

    const outgoingRefs = this.repo.references.getReferencesFrom(targetFunc.id);
    for (const ref of outgoingRefs) {
      if (ref.edgeKind === 'CALLS') {
        const callee = symbols.find(s => s.id === ref.toNodeId);
        if (callee) {
          callees.push(callee);
        }
      }
    }

    return callees;
  }
}
