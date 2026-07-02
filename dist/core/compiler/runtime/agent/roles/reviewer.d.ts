import { ReviewerRole, CandidateFinding, VerificationVote } from './interface';
import { ExecutionContext } from '../../context';
export declare class DefaultReviewerRole implements ReviewerRole {
    review(candidates: CandidateFinding[], ctx: ExecutionContext): Promise<VerificationVote[]>;
}
//# sourceMappingURL=reviewer.d.ts.map