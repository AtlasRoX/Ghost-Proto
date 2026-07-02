export interface AnalysisQueryIntent {
  action: 'NavigateDefinition' | 'TraceCallers' | 'TraceTaint';
  params: Record<string, string>;
}

export interface AnalysisQueryPlan {
  steps: { service: string; method: string; args: any[] }[];
}

export class AnalysisQueryPlanner {
  public plan(intent: AnalysisQueryIntent): AnalysisQueryPlan {
    const steps: AnalysisQueryPlan['steps'] = [];

    if (intent.action === 'NavigateDefinition') {
      steps.push({
        service: 'navigation',
        method: 'findDefinition',
        args: [intent.params.symbolFqn]
      });
    } else if (intent.action === 'TraceCallers') {
      steps.push({
        service: 'navigation',
        method: 'findCallers',
        args: [intent.params.funcFqn]
      });
    } else if (intent.action === 'TraceTaint') {
      steps.push({
        service: 'trace',
        method: 'traceTaint',
        args: [intent.params.funcFqn, intent.params.sources, intent.params.sinks]
      });
    }

    return { steps };
  }
}
