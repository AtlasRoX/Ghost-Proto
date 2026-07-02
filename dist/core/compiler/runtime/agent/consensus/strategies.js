"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnanimousConsensusStrategy = exports.MajorityConsensusStrategy = void 0;
class MajorityConsensusStrategy {
    evaluate(candidates, votes) {
        return candidates.filter(cand => {
            const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
            const yesVotes = candVotes.filter(v => v.approved).length;
            return yesVotes >= Math.ceil(candVotes.length / 2) && candVotes.length > 0;
        });
    }
}
exports.MajorityConsensusStrategy = MajorityConsensusStrategy;
class UnanimousConsensusStrategy {
    evaluate(candidates, votes) {
        return candidates.filter(cand => {
            const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
            const yesVotes = candVotes.filter(v => v.approved).length;
            return yesVotes === candVotes.length && candVotes.length > 0;
        });
    }
}
exports.UnanimousConsensusStrategy = UnanimousConsensusStrategy;
//# sourceMappingURL=strategies.js.map