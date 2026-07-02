import { ReviewerRole, CandidateFinding, VerificationVote } from './interface';
import { ExecutionContext } from '../../context';

export class DefaultReviewerRole implements ReviewerRole {
  public async review(candidates: CandidateFinding[], ctx: ExecutionContext): Promise<VerificationVote[]> {
    ctx.logEvent('AGENT_REVIEWER_START', `Reviewing ${candidates.length} candidates`);

    return candidates.map(c => {
      // Mock review check: If confidence is low, cast rejection vote
      const approved = c.confidence >= 0.7;
      return {
        candidateFindingId: c.id,
        voter: 'Reviewer_1',
        approved,
        confidence: 0.85
      };
    });
  }
}
