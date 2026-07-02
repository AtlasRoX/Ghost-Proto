import { CandidateFinding, VerificationVote, AuditObjective } from '../roles/interface';
import { Finding } from '../../../analysis/store/evidence';
export declare class ConsensusEngine {
    private strategies;
    resolve(candidates: CandidateFinding[], votes: VerificationVote[], policy: AuditObjective['consensusPolicy']): Finding[];
}
//# sourceMappingURL=index.d.ts.map