import { JudgeRole, CandidateFinding, VerificationVote, AuditObjective } from './interface';
import { Finding } from '../../../analysis/store/evidence';
export declare class DefaultJudgeRole implements JudgeRole {
    decide(candidates: CandidateFinding[], votes: VerificationVote[], policy: AuditObjective['consensusPolicy']): Promise<Finding[]>;
}
//# sourceMappingURL=judge.d.ts.map