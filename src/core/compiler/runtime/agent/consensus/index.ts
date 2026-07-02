import { CandidateFinding, VerificationVote, AuditObjective } from '../roles/interface';
import { Finding } from '../../../analysis/store/evidence';
import { MajorityConsensusStrategy, UnanimousConsensusStrategy, ConsensusStrategy } from './strategies';

export class ConsensusEngine {
  private strategies = new Map<AuditObjective['consensusPolicy'], ConsensusStrategy>([
    ['majority', new MajorityConsensusStrategy()],
    ['unanimous', new UnanimousConsensusStrategy()]
  ]);

  public resolve(
    candidates: CandidateFinding[],
    votes: VerificationVote[],
    policy: AuditObjective['consensusPolicy']
  ): Finding[] {
    const strategy = this.strategies.get(policy);
    if (!strategy) {
      throw new Error(`Consensus strategy not found for policy: ${policy}`);
    }

    const verifiedCandidates = strategy.evaluate(candidates, votes);
    return verifiedCandidates.map(c => c.finding);
  }
}
