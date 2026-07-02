import { JudgeRole, CandidateFinding, VerificationVote, AuditObjective } from './interface';
import { Finding } from '../../../analysis/store/evidence';

export class DefaultJudgeRole implements JudgeRole {
  public async decide(
    candidates: CandidateFinding[],
    votes: VerificationVote[],
    policy: AuditObjective['consensusPolicy']
  ): Promise<Finding[]> {
    const verified: Finding[] = [];

    for (const cand of candidates) {
      const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
      const approveCount = candVotes.filter(v => v.approved).length;

      let consensusReached = false;
      if (policy === 'unanimous') {
        consensusReached = approveCount === candVotes.length && candVotes.length > 0;
      } else {
        // majority
        consensusReached = approveCount >= Math.ceil(candVotes.length / 2) && candVotes.length > 0;
      }

      if (consensusReached) {
        verified.push(cand.finding);
      }
    }

    return verified;
  }
}
