"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaintTracer = void 0;
const taint_1 = require("../engine/taint");
const ssa_1 = require("../engine/ssa");
class TaintTracer {
    static traceTaint(statements, sources, sinks) {
        const ssa = ssa_1.SSATransformer.transform(statements);
        return taint_1.TaintTracer.trace(ssa, sources, sinks);
    }
}
exports.TaintTracer = TaintTracer;
//# sourceMappingURL=taint.js.map