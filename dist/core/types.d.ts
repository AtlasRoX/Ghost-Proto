export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AuditCategory = 'security' | 'quality' | 'performance' | 'architecture' | 'dependencies' | 'testing' | 'documentation';
export interface Finding {
    id: string;
    category: AuditCategory;
    severity: Severity;
    title: string;
    description: string;
    file?: string;
    line?: number;
    snippet?: string;
    fix?: string;
    references?: string[];
}
export interface CategoryScore {
    category: AuditCategory;
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    findings: Finding[];
    summary: string;
}
export interface ProjectInfo {
    name: string;
    path: string;
    languages: Record<string, number>;
    frameworks: string[];
    totalFiles: number;
    totalLines: number;
    hasTests: boolean;
    hasDependencyFile: boolean;
    dependencyFile?: string;
    dependencies: Record<string, string>;
    testFrameworks: string[];
    packageManager?: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'cargo' | 'go' | 'maven' | 'gradle';
}
export interface ScannedFile {
    path: string;
    relativePath: string;
    language: string;
    lines: number;
    size: number;
    content: string;
}
export interface ToolCallRecord {
    turn: number;
    toolUseId: string;
    name: string;
    input: Record<string, unknown>;
    outputPreview: string;
    outputBytes: number;
    durationMs: number;
    isError: boolean;
    timestamp: string;
}
export interface AgentTraceSummary {
    turns: number;
    toolCalls: number;
    errors: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
    stopReason: 'completed' | 'max_turns' | 'max_budget' | 'repetition' | 'error';
    stopDetail?: string;
    durationMs: number;
    toolUsage: Record<string, number>;
}
export interface AgentTrace {
    enabled: true;
    model: string;
    maxTurns: number;
    maxBudgetTokens: number;
    summary: AgentTraceSummary;
    calls: ToolCallRecord[];
}
export interface AuditReport {
    version: string;
    timestamp: string;
    project: ProjectInfo;
    overallScore: number;
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    categories: CategoryScore[];
    allFindings: Finding[];
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    aiPowered: boolean;
    agentic?: boolean;
    agentTrace?: AgentTrace;
    durationMs: number;
}
export interface AuditOptions {
    path: string;
    apiKey?: string;
    output: ('terminal' | 'markdown' | 'html' | 'json')[];
    categories?: AuditCategory[];
    maxFileSize: number;
    maxFiles: number;
    model: string;
    noAi: boolean;
    quiet: boolean;
    agentic: boolean;
    maxTurns: number;
    maxBudgetTokens: number;
    trace: boolean;
}
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export declare function scoreToGrade(score: number): Grade;
//# sourceMappingURL=types.d.ts.map