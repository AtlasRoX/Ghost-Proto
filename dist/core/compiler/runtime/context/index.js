"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = void 0;
const working_1 = require("../memory/working");
const session_1 = require("../memory/session");
const blackboard_1 = require("../memory/blackboard");
const policy_1 = require("../memory/policy");
const knowledge_1 = require("../knowledge");
class ExecutionContext {
    constructor(repository, analysis) {
        this.repository = repository;
        this.analysis = analysis;
        this.workingMemory = new working_1.WorkingMemory();
        this.sessionMemory = new session_1.SessionMemory();
        this.blackboard = new blackboard_1.Blackboard();
        this.policies = new policy_1.MemoryPolicies();
        this.knowledgeBase = new knowledge_1.KnowledgeBase();
        this.eventLog = [];
        this.metrics = { tokensUsed: 0, latencyMs: 0, workerCount: 0 };
    }
    logEvent(type, message) {
        this.eventLog.push({
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type,
            timestamp: new Date().toISOString(),
            message
        });
    }
    recordTokens(count) {
        this.metrics.tokensUsed += count;
    }
    setLatency(durationMs) {
        this.metrics.latencyMs = durationMs;
    }
    dispose() {
        this.workingMemory.clear();
        this.sessionMemory.clear();
        this.blackboard.clear();
        this.policies.clear();
        this.knowledgeBase.clear();
        this.eventLog = [];
        this.metrics = { tokensUsed: 0, latencyMs: 0, workerCount: 0 };
    }
}
exports.ExecutionContext = ExecutionContext;
//# sourceMappingURL=index.js.map