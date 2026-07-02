"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusEngine = void 0;
const strategies_1 = require("./strategies");
class ConsensusEngine {
    constructor() {
        this.strategies = new Map([
            ['majority', new strategies_1.MajorityConsensusStrategy()],
            ['unanimous', new strategies_1.UnanimousConsensusStrategy()]
        ]);
    }
    resolve(candidates, votes, policy) {
        const strategy = this.strategies.get(policy);
        if (!strategy) {
            throw new Error(`Consensus strategy not found for policy: ${policy}`);
        }
        const verifiedCandidates = strategy.evaluate(candidates, votes);
        return verifiedCandidates.map(c => c.finding);
    }
}
exports.ConsensusEngine = ConsensusEngine;
//# sourceMappingURL=index.js.map