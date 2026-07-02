import type { ScannedFile, ProjectInfo, Finding, CategoryScore, AuditCategory, AgentTrace } from '../../core/types';
import { type AgentLoopHooks } from './agent-loop';
export declare function analyzeWithGhostProto(files: ScannedFile[], info: ProjectInfo, apiKey: string, model: string, filterCategories?: AuditCategory[]): Promise<CategoryScore[]>;
export interface AgenticAnalysisOptions {
    projectRoot: string;
    info: ProjectInfo;
    staticFindings: Finding[];
    apiKey: string;
    model: string;
    maxTurns: number;
    maxBudgetTokens: number;
    filterCategories?: AuditCategory[];
    files: ScannedFile[];
    hooks?: AgentLoopHooks;
}
export interface AgenticAnalysisResult {
    categories: CategoryScore[];
    trace: AgentTrace;
}
export declare function analyzeWithGhostProtoAgent(opts: AgenticAnalysisOptions): Promise<AgenticAnalysisResult>;
//# sourceMappingURL=ghostproto-analyzer.d.ts.map