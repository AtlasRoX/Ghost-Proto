import { RepositoryContext } from '../repository/context';
import { CallGraphEdge } from './graph/call';
import { DependencyEdge } from './graph/dependency';
import { CFG } from './graph/cfg';
import { GraphBuilder } from './graph/builder';
import { EvidenceStore, Finding } from './store/evidence';
import { RuleRegistry } from './rules/registry';
import { RuleEngine } from './rules/engine';

import { NavigationService } from './navigation';
import { AnalysisQueryEngine } from './query/engine';
import { AnalysisQueryExecutor } from './query/executor';

export interface AnalysisDiagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export class AnalysisContext {
  public callGraph: CallGraphEdge[] = [];
  public dependencyGraph: DependencyEdge[] = [];
  public cfgs = new Map<string, CFG>();
  
  public evidenceStore = new EvidenceStore();
  public ruleRegistry = new RuleRegistry();
  public diagnostics: AnalysisDiagnostic[] = [];

  public navigation: NavigationService;
  public queryEngine: AnalysisQueryEngine;

  constructor(public readonly repository: RepositoryContext) {
    this.navigation = new NavigationService(repository);
    const executor = new AnalysisQueryExecutor(this.navigation, repository);
    this.queryEngine = new AnalysisQueryEngine(executor);
    this.rebuildGraphs();
  }

  public rebuildGraphs(): void {
    const graphs = GraphBuilder.buildGraphs(this.repository);
    this.callGraph = graphs.callGraph;
    this.dependencyGraph = graphs.dependencyGraph;
    this.cfgs = graphs.cfgs;
  }

  public async analyze(): Promise<Finding[]> {
    const engine = new RuleEngine(this.ruleRegistry);
    const observations = await engine.runAll(this);
    this.evidenceStore.ingest(observations);
    return this.evidenceStore.getFindings();
  }
}
