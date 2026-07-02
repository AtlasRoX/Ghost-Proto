"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverridesTracer = void 0;
class OverridesTracer {
    constructor(repo) {
        this.repo = repo;
    }
    findImplementations(interfaceFqn) {
        const impls = [];
        const symbols = Array.from(this.repo.index.symbols.values());
        const targetInterface = symbols.find(s => s.fqn === interfaceFqn);
        if (!targetInterface)
            return [];
        const incomingRefs = this.repo.references.getReferencesTo(targetInterface.id);
        for (const ref of incomingRefs) {
            if (ref.edgeKind === 'IMPLEMENTS') {
                const impl = symbols.find(s => s.id === ref.fromNodeId);
                if (impl) {
                    impls.push(impl);
                }
            }
        }
        return impls;
    }
    findOverrides(methodFqn) {
        const overrides = [];
        const symbols = Array.from(this.repo.index.symbols.values());
        const targetMethod = symbols.find(s => s.fqn === methodFqn);
        if (!targetMethod)
            return [];
        const incomingRefs = this.repo.references.getReferencesTo(targetMethod.id);
        for (const ref of incomingRefs) {
            if (ref.edgeKind === 'OVERRIDES') {
                const overrider = symbols.find(s => s.id === ref.fromNodeId);
                if (overrider) {
                    overrides.push(overrider);
                }
            }
        }
        return overrides;
    }
}
exports.OverridesTracer = OverridesTracer;
//# sourceMappingURL=overrides.js.map