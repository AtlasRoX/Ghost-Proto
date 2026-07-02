import { CandidateFinding, VerificationVote } from '../roles/interface';
export interface ConsensusStrategy {
    evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[];
}
export declare class MajorityConsensusStrategy implements ConsensusStrategy {
    evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[];
}
export declare class UnanimousConsensusStrategy implements ConsensusStrategy {
    evaluate(candidates: CandidateFinding[], votes: VerificationVote[]): CandidateFinding[];
}
//# sourceMappingURL=strategies.d.ts.map