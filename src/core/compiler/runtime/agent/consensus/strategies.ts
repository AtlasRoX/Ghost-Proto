import { CandidateFinding, VerificationVote } from '../roles/interface';

export interface ConsensusStrategy {
  evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[];
}

export class MajorityConsensusStrategy implements ConsensusStrategy {
  public evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[] {
    return candidates.filter(cand => {
      const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
      const yesVotes = candVotes.filter(v => v.approved).length;
      return yesVotes >= Math.ceil(candVotes.length / 2) && candVotes.length > 0;
    });
  }
}

export class UnanimousConsensusStrategy implements ConsensusStrategy {
  public evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[] {
    return candidates.filter(cand => {
      const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
      const yesVotes = candVotes.filter(v => v.approved).length;
      return yesVotes === candVotes.length && candVotes.length > 0;
    });
  }
}
