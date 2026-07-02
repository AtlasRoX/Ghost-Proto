"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallGraphBuilder = void 0;
class CallGraphBuilder {
    static build(context) {
        const edges = [];
        const symbols = Array.from(context.index.symbols.values());
        const functions = symbols.filter(s => s.symbolKind === 'Function');
        for (const func of functions) {
            // Find all call reference edges pointing from this function to another function
            const outboundRefs = context.references.getReferencesFrom(func.id);
            for (const ref of outboundRefs) {
                if (ref.edgeKind === 'CALLS') {
                    // Find target symbol
                    const targetSym = symbols.find(s => s.id === ref.toNodeId);
                    if (targetSym) {
                        edges.push({
                            callerFqn: func.fqn,
                            calleeFqn: targetSym.fqn
                        });
                    }
                }
            }
        }
        return edges;
    }
}
exports.CallGraphBuilder = CallGraphBuilder;
//# sourceMappingURL=call.js.map