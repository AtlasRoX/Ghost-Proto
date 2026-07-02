import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';

export class OverridesTracer {
  constructor(private repo: RepositoryContext) {}

  public findImplementations(interfaceFqn: string): IRSymbol[] {
    const impls: IRSymbol[] = [];
    const symbols = Array.from(this.repo.index.symbols.values());
    const targetInterface = symbols.find(s => s.fqn === interfaceFqn);
    if (!targetInterface) return [];

    const incomingRefs = this.repo.references.getReferencesTo(targetInterface.id);
    for (const ref of incomingRefs) {
      if (ref.edgeKind === 'IMPLEMENTS') {
        const impl = symbols.find(s => s.id === ref.fromNodeId);
        if (impl) {
          impls.push(impl);
        }
      }
    }

    return impls;
  }

  public findOverrides(methodFqn: string): IRSymbol[] {
    const overrides: IRSymbol[] = [];
    const symbols = Array.from(this.repo.index.symbols.values());
    const targetMethod = symbols.find(s => s.fqn === methodFqn);
    if (!targetMethod) return [];

    const incomingRefs = this.repo.references.getReferencesTo(targetMethod.id);
    for (const ref of incomingRefs) {
      if (ref.edgeKind === 'OVERRIDES') {
        const overrider = symbols.find(s => s.id === ref.fromNodeId);
        if (overrider) {
          overrides.push(overrider);
        }
      }
    }

    return overrides;
  }
}
