import type { AgentTraceSummary, ToolCallRecord } from '../core/types';
import type { ToolCallMeta, TurnStartInfo, TurnEndInfo } from '../analyzers/ai/agent-loop';
export interface AgentLoggerOptions {
    /** Show per-turn token deltas, tool durations, result previews. */
    verbose?: boolean;
    /** Disable coloured output (e.g. when not a TTY). */
    noColor?: boolean;
    /** Where the logger writes. Defaults to process.stderr so stdout stays
     *  clean for `--json` consumers. */
    stream?: NodeJS.WriteStream;
}
export interface AgentLoggerHeader {
    model: string;
    maxTurns: number;
    maxBudgetTokens: number;
}
export declare class AgentLogger {
    private readonly verbose;
    private readonly out;
    private readonly useColor;
    private spinner?;
    private currentTurnStart;
    private startWallTime;
    constructor(opts?: AgentLoggerOptions);
    private write;
    private rule;
    start(header: AgentLoggerHeader): void;
    turnStart(info: TurnStartInfo): void;
    /**
     * Called right after GhostProto's response arrives. Stops the spinner so the
     * tool call lines can stream in cleanly.
     */
    apiResponse(info: {
        turn: number;
        toolCalls: number;
    }): void;
    toolCall(record: ToolCallRecord, meta: ToolCallMeta): void;
    turnEnd(info: TurnEndInfo): void;
    /** Called for soft events (errors, retries, warnings). */
    progress(msg: string): void;
    finish(summary: AgentTraceSummary): void;
    private startSpinner;
    private stopSpinner;
}
//# sourceMappingURL=agent-log.d.ts.map