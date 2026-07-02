"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallersTracker = void 0;
class CallersTracker {
    constructor(repo) {
        this.repo = repo;
    }
    findCallers(funcFqn) {
        const callers = [];
        const symbols = Array.from(this.repo.index.symbols.values());
        const targetFunc = symbols.find(s => s.fqn === funcFqn);
        if (!targetFunc)
            return [];
        const incomingRefs = this.repo.references.getReferencesTo(targetFunc.id);
        for (const ref of incomingRefs) {
            if (ref.edgeKind === 'CALLS') {
                const caller = symbols.find(s => s.id === ref.fromNodeId);
                if (caller) {
                    callers.push(caller);
                }
            }
        }
        return callers;
    }
    findCallees(funcFqn) {
        const callees = [];
        const symbols = Array.from(this.repo.index.symbols.values());
        const targetFunc = symbols.find(s => s.fqn === funcFqn);
        if (!targetFunc)
            return [];
        const outgoingRefs = this.repo.references.getReferencesFrom(targetFunc.id);
        for (const ref of outgoingRefs) {
            if (ref.edgeKind === 'CALLS') {
                const callee = symbols.find(s => s.id === ref.toNodeId);
                if (callee) {
                    callees.push(callee);
                }
            }
        }
        return callees;
    }
}
exports.CallersTracker = CallersTracker;
//# sourceMappingURL=callers.js.map