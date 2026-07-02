"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReviewerRole = void 0;
class DefaultReviewerRole {
    async review(candidates, ctx) {
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
exports.DefaultReviewerRole = DefaultReviewerRole;
//# sourceMappingURL=reviewer.js.map