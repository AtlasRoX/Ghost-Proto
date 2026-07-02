"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSession = void 0;
class AgentSession {
    constructor(id, objective, context) {
        this.id = id;
        this.objective = objective;
        this.context = context;
        this.candidateFindings = [];
        this.verifiedFindings = [];
        this.executionTrace = [];
    }
    logTrace(message) {
        this.executionTrace.push(`[${new Date().toISOString()}] ${message}`);
    }
}
exports.AgentSession = AgentSession;
//# sourceMappingURL=session.js.map