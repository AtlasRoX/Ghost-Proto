import type { ProjectInfo, Finding } from '../../core/types';
export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: Record<string, any>;
}
export interface ToolExecutionResult {
    isError: boolean;
    content: string;
    bytes: number;
}
export interface ToolContext {
    projectRoot: string;
    projectInfo: ProjectInfo;
    staticFindings: Finding[];
    /** Called when finalize_audit fires; signals the loop to stop. */
    onFinalize: (audit: FinalAuditPayload) => void;
}
export interface FinalAuditPayload {
    security?: CategoryPayload;
    quality?: CategoryPayload;
    performance?: CategoryPayload;
    architecture?: CategoryPayload;
    testing?: CategoryPayload;
    documentation?: CategoryPayload;
    dependencies?: CategoryPayload;
}
export interface CategoryPayload {
    score: number;
    summary: string;
    findings: Partial<Finding>[];
}
/**
 * Resolve a user-supplied path against the project root and reject anything
 * that would escape the root. Returns the absolute resolved path or null.
 */
export declare function safeResolve(projectRoot: string, userPath: string): string | null;
export type ToolName = 'list_files' | 'read_file' | 'search_code' | 'read_dependency_manifest' | 'get_project_summary' | 'get_static_findings' | 'finalize_audit';
type Executor = (ctx: ToolContext, input: Record<string, unknown>) => ToolExecutionResult | Promise<ToolExecutionResult>;
export declare const TOOL_EXECUTORS: Record<ToolName, Executor>;
/**
 * Tool definitions sent to the Claude API. Shape matches `Anthropic.Tool`.
 * We intentionally keep descriptions concrete and call out what NOT to use
 * the tool for — Claude reads descriptions and calibrates accordingly.
 */
export declare function buildToolDefinitions(): ToolDefinition[];
export {};
//# sourceMappingURL=tools.d.ts.map