"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableTracer = void 0;
const ssa_1 = require("../engine/ssa");
class VariableTracer {
    static traceVariable(statements, targetVar) {
        const ssa = ssa_1.SSATransformer.transform(statements);
        // Find all assignments/statements where the variable is defined or used
        return ssa.filter(stmt => {
            const isDef = stmt.defined?.name === targetVar;
            const isUsed = stmt.used.some(u => u.name === targetVar);
            return isDef || isUsed;
        });
    }
}
exports.VariableTracer = VariableTracer;
//# sourceMappingURL=variable.js.map