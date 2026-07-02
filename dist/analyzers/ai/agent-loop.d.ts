import type { AgentTrace, AgentTraceSummary, ToolCallRecord, AuditCategory, ProjectInfo, ScannedFile, CategoryScore } from '../../core/types';
import { type ToolContext } from './tools';
export interface TurnStartInfo {
    turn: number;
    maxTurns: number;
}
export interface TurnEndInfo {
    turn: number;
    /** Tokens the model spent on *this* turn alone (delta vs cumulative). */
    turnInputTokens: number;
    turnOutputTokens: number;
    turnCacheReadTokens: number;
    turnCacheCreationTokens: number;
    /** Running totals after this turn. */
    cumulativeInputTokens: number;
    cumulativeOutputTokens: number;
    cumulativeCacheReadTokens: number;
    /** Wall-clock duration of this turn (API call + tool execution). */
    durationMs: number;
    /** How many tool_use blocks GhostProto emitted this turn. */
    toolCalls: number;
}
export interface ToolCallMeta {
    indexInTurn: number;
    totalInTurn: number;
}
export interface AgentLoopHooks {
    onProgress?: (msg: string) => void;
    onToolCall?: (record: ToolCallRecord, meta: ToolCallMeta) => void;
    onTurnStart?: (info: TurnStartInfo) => void;
    onTurnEnd?: (info: TurnEndInfo) => void;
    onFinish?: (summary: AgentTraceSummary) => void;
    /** Emitted when the model's response arrives but before tools execute. */
    onApiResponse?: (info: {
        turn: number;
        toolCalls: number;
    }) => void;
}
export interface AgentLoopOptions {
    apiKey: string;
    model: string;
    maxTurns: number;
    maxBudgetTokens: number;
    filterCategories?: AuditCategory[];
}
export interface AgentLoopResult {
    categories: CategoryScore[];
    trace: AgentTrace;
}
export interface OpenAiMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content?: string | null;
    tool_calls?: OpenAiToolCall[];
    tool_call_id?: string;
    name?: string;
}
export interface OpenAiToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export declare function buildInitialUserPrompt(info: ProjectInfo, files: ScannedFile[], filterCategories?: AuditCategory[]): string;
export declare function detectRepetition(recent: string[], nextHash: string): boolean;
export declare function hashToolCall(name: string, input: Record<string, unknown>): string;
export declare function runAgentLoop(ctx: ToolContext, opts: AgentLoopOptions, hooks: AgentLoopHooks | undefined, initialUserPrompt: string): Promise<AgentLoopResult>;
//# sourceMappingURL=agent-loop.d.ts.map