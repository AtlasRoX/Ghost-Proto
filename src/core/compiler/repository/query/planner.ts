export interface QueryIntent {
  action: 'FindSymbol' | 'FindReferences' | 'GetMetrics';
  params: Record<string, string>;
}

export interface QueryPlan {
  steps: { service: string; method: string; args: string[] }[];
}

export class QueryPlanner {
  public plan(intent: QueryIntent): QueryPlan {
    const steps: QueryPlan['steps'] = [];

    if (intent.action === 'FindSymbol') {
      steps.push({
        service: 'symbol',
        method: 'getSymbol',
        args: [intent.params.fqn]
      });
    } else if (intent.action === 'FindReferences') {
      steps.push({
        service: 'reference',
        method: 'getReferencesTo',
        args: [intent.params.nodeId]
      });
    } else if (intent.action === 'GetMetrics') {
      steps.push({
        service: 'metrics',
        method: 'getMetrics',
        args: []
      });
    }

    return { steps };
  }
}
