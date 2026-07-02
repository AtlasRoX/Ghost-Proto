import { RepositoryContext } from '../../repository/context';
import { AnalysisContext } from '../../analysis/context';
import { WorkingMemory } from '../memory/working';
import { SessionMemory } from '../memory/session';
import { Blackboard } from '../memory/blackboard';
import { MemoryPolicies } from '../memory/policy';
import { KnowledgeBase } from '../knowledge';
export interface RuntimeMetrics {
    tokensUsed: number;
    latencyMs: number;
    workerCount: number;
}
export interface RuntimeEvent {
    id: string;
    type: string;
    timestamp: string;
    message: string;
}
export declare class ExecutionContext {
    readonly repository: RepositoryContext;
    readonly analysis: AnalysisContext;
    workingMemory: WorkingMemory;
    sessionMemory: SessionMemory;
    blackboard: Blackboard;
    policies: MemoryPolicies;
    knowledgeBase: KnowledgeBase;
    eventLog: RuntimeEvent[];
    metrics: RuntimeMetrics;
    constructor(repository: RepositoryContext, analysis: AnalysisContext);
    logEvent(type: string, message: string): void;
    recordTokens(count: number): void;
    setLatency(durationMs: number): void;
    dispose(): void;
}
//# sourceMappingURL=index.d.ts.map