import { RepositoryContext } from '../repository/context';
import { CallGraphEdge } from './graph/call';
import { DependencyEdge } from './graph/dependency';
import { CFG } from './graph/cfg';
import { EvidenceStore, Finding } from './store/evidence';
import { RuleRegistry } from './rules/registry';
import { NavigationService } from './navigation';
import { AnalysisQueryEngine } from './query/engine';
export interface AnalysisDiagnostic {
    severity: 'error' | 'warning' | 'info';
    code: string;
    message: string;
}
export declare class AnalysisContext {
    readonly repository: RepositoryContext;
    callGraph: CallGraphEdge[];
    dependencyGraph: DependencyEdge[];
    cfgs: Map<string, CFG>;
    evidenceStore: EvidenceStore;
    ruleRegistry: RuleRegistry;
    diagnostics: AnalysisDiagnostic[];
    navigation: NavigationService;
    queryEngine: AnalysisQueryEngine;
    constructor(repository: RepositoryContext);
    rebuildGraphs(): void;
    analyze(): Promise<Finding[]>;
}
//# sourceMappingURL=context.d.ts.map