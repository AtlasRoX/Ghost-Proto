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

export class ExecutionContext {
  public workingMemory = new WorkingMemory();
  public sessionMemory = new SessionMemory();
  public blackboard = new Blackboard();
  public policies = new MemoryPolicies();
  public knowledgeBase = new KnowledgeBase();
  
  public eventLog: RuntimeEvent[] = [];
  public metrics: RuntimeMetrics = { tokensUsed: 0, latencyMs: 0, workerCount: 0 };

  constructor(
    public readonly repository: RepositoryContext,
    public readonly analysis: AnalysisContext
  ) {}

  public logEvent(type: string, message: string): void {
    this.eventLog.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      message
    });
  }

  public recordTokens(count: number): void {
    this.metrics.tokensUsed += count;
  }

  public setLatency(durationMs: number): void {
    this.metrics.latencyMs = durationMs;
  }

  public dispose(): void {
    this.workingMemory.clear();
    this.sessionMemory.clear();
    this.blackboard.clear();
    this.policies.clear();
    this.knowledgeBase.clear();
    this.eventLog = [];
    this.metrics = { tokensUsed: 0, latencyMs: 0, workerCount: 0 };
  }
}
