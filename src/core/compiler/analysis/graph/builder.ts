import { RepositoryContext } from '../../repository/context';
import { CallGraphBuilder, CallGraphEdge } from './call';
import { DependencyGraphBuilder, DependencyEdge } from './dependency';
import { CFGBuilder, CFG } from './cfg';

export class GraphBuilder {
  public static buildGraphs(context: RepositoryContext): {
    callGraph: CallGraphEdge[];
    dependencyGraph: DependencyEdge[];
    cfgs: Map<string, CFG>;
  } {
    const callGraph = CallGraphBuilder.build(context);
    const dependencyGraph = DependencyGraphBuilder.build(context);
    const cfgs = new Map<string, CFG>();

    const symbols = Array.from(context.index.symbols.values());
    const functions = symbols.filter(s => s.symbolKind === 'Function');

    for (const func of functions) {
      cfgs.set(func.fqn, CFGBuilder.build(func));
    }

    return {
      callGraph,
      dependencyGraph,
      cfgs
    };
  }
}
