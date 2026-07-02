import { ContextGraph } from './graph';
import { ContextBudget, ContextPackage } from './schema';

export class ContextOptimizer {
  public static optimize(graph: ContextGraph, budget: ContextBudget): ContextPackage {
    const symbols = graph.getSymbols().slice(0, budget.maxSymbols);
    const findings = graph.getFindings().slice(0, budget.maxEvidence);
    const paths = graph.getPaths().slice(0, budget.maxPaths);

    return {
      symbols,
      findings,
      paths,
      metrics: {
        symbolCount: symbols.length,
        findingsCount: findings.length,
        pathsCount: paths.length
      }
    };
  }
}
