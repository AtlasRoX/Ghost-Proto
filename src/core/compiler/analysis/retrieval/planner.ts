export interface RetrievalIntent {
  filePaths: string[];
  symbolFqns: string[];
}

export interface RetrievalPlan {
  steps: { action: 'FetchSymbols' | 'FetchFindings' | 'FetchPaths'; args: any[] }[];
}

export class RetrievalPlanner {
  public plan(intent: RetrievalIntent): RetrievalPlan {
    const steps: RetrievalPlan['steps'] = [];

    // Step 1: Fetch target symbols
    steps.push({
      action: 'FetchSymbols',
      args: [intent.symbolFqns]
    });

    // Step 2: Fetch findings related to target files
    steps.push({
      action: 'FetchFindings',
      args: [intent.filePaths]
    });

    // Step 3: Fetch import/dependency paths
    steps.push({
      action: 'FetchPaths',
      args: [intent.filePaths]
    });

    return { steps };
  }
}
