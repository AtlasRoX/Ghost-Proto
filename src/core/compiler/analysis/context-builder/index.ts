import { RetrievedEvidenceSet } from '../retrieval/executor';
import { ContextGraph } from './graph';
import { ContextBudget, ContextPackage } from './schema';
import { ContextOptimizer } from './optimizer';

export class ContextBuilder {
  public static buildPackage(
    evidence: RetrievedEvidenceSet,
    budget: ContextBudget,
    policyName?: string
  ): ContextPackage {
    const graph = new ContextGraph();

    // Ingest findings
    for (const finding of evidence.findings) {
      graph.addNode({
        id: finding.id,
        type: 'finding',
        data: finding
      });
    }

    // Ingest symbols
    for (const sym of evidence.symbols) {
      graph.addNode({
        id: sym.id,
        type: 'symbol',
        data: sym
      });
    }

    // Ingest dependency paths
    for (let i = 0; i < evidence.paths.length; i++) {
      const path = evidence.paths[i];
      graph.addNode({
        id: `path:${i}`,
        type: 'path',
        data: path
      });
    }

    // Optimize against budget limits
    const pkg = ContextOptimizer.optimize(graph, budget);
    pkg.policyName = policyName;

    return pkg;
  }
}
