import type { AuditReport, AuditOptions } from './types';
import type { AgentLoopHooks } from '../analyzers/ai/agent-loop';
export interface AuditHooks {
    /** Hooks forwarded into the agentic loop (turn start/end, tool calls, etc.). */
    agent?: AgentLoopHooks;
}
export declare function runAudit(options: AuditOptions, onProgress: (msg: string) => void, hooks?: AuditHooks): Promise<AuditReport>;
//# sourceMappingURL=auditor.d.ts.map