import { ExecutionContext } from '../../context';
import { ExecutionTask } from '../../executor/dag';
import { Finding } from '../../../analysis/store/evidence';
export interface AuditObjective {
    id: string;
    category: string;
    description: string;
    requiredCapabilities: string[];
    rulePacks: string[];
    retrievalStrategy: string;
    promptProfile: string;
    consensusPolicy: 'majority' | 'unanimous';
    maxCostLimit: number;
}
export interface CandidateFinding {
    id: string;
    finding: Finding;
    confidence: number;
    sourceWorker: string;
}
export interface VerificationVote {
    candidateFindingId: string;
    voter: string;
    approved: boolean;
    confidence: number;
}
export interface PlannerRole {
    plan(objective: AuditObjective, ctx: ExecutionContext): Promise<ExecutionTask[]>;
}
export interface WorkerRole {
    execute(task: ExecutionTask, ctx: ExecutionContext): Promise<CandidateFinding[]>;
}
export interface ReviewerRole {
    review(candidates: CandidateFinding[], ctx: ExecutionContext): Promise<VerificationVote[]>;
}
export interface JudgeRole {
    decide(candidates: CandidateFinding[], votes: VerificationVote[], policy: AuditObjective['consensusPolicy']): Promise<Finding[]>;
}
//# sourceMappingURL=interface.d.ts.map