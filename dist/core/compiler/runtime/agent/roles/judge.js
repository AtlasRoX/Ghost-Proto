"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultJudgeRole = void 0;
class DefaultJudgeRole {
    async decide(candidates, votes, policy) {
        const verified = [];
        for (const cand of candidates) {
            const candVotes = votes.filter(v => v.candidateFindingId === cand.id);
            const approveCount = candVotes.filter(v => v.approved).length;
            let consensusReached = false;
            if (policy === 'unanimous') {
                consensusReached = approveCount === candVotes.length && candVotes.length > 0;
            }
            else {
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
exports.DefaultJudgeRole = DefaultJudgeRole;
//# sourceMappingURL=judge.js.map