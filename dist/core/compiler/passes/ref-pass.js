"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferencePass = void 0;
const builder_1 = require("../model/builder");
class ReferencePass {
    constructor() {
        this.name = 'ReferencePass';
        this.dependencies = ['ScopePass', 'ImportPass'];
        this.invalidates = [];
        this.parallelizable = true;
    }
    async execute(ctx, ir) {
        const nextIr = [...ir];
        // Collect defined symbols
        const symbols = nextIr.filter(n => n.kind === 'Symbol');
        const moduleSymbols = symbols.filter(s => s.symbolKind === 'Module');
        const functionSymbols = symbols.filter(s => s.symbolKind === 'Function');
        // Automatically draw edges linking functions to their parent modules
        for (const func of functionSymbols) {
            const parent = moduleSymbols.find(m => func.parentFqn === m.fqn);
            if (parent) {
                const edge = builder_1.ImmutableIRBuilder.createEdge('OWNS', parent.id, func.id, func.span, func.origin);
                nextIr.push(edge);
            }
        }
        return nextIr;
    }
}
exports.ReferencePass = ReferencePass;
//# sourceMappingURL=ref-pass.js.map