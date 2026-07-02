"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaintTracer = void 0;
class TaintTracer {
    static trace(ssaStatements, sources, sinks) {
        const tainted = new Set(); // "name_version"
        const paths = [];
        // Initialize sources as tainted
        for (const stmt of ssaStatements) {
            if (stmt.defined && sources.includes(stmt.defined.name)) {
                tainted.add(`${stmt.defined.name}_${stmt.defined.version}`);
            }
        }
        // Propagate taint
        for (const stmt of ssaStatements) {
            if (!stmt.defined)
                continue;
            const isUsedTainted = stmt.used.some(u => tainted.has(`${u.name}_${u.version}`));
            // If a used variable is tainted, the defined variable becomes tainted
            if (isUsedTainted) {
                tainted.add(`${stmt.defined.name}_${stmt.defined.version}`);
            }
            // Check if taint reaches a sink operation
            const isSink = sinks.some(sink => stmt.op.includes(sink));
            if (isSink && (isUsedTainted || sources.includes(stmt.defined.name))) {
                paths.push({
                    source: sources.find(src => stmt.op.includes(src) || isUsedTainted) || 'unknown',
                    sink: stmt.op,
                    steps: ssaStatements.map(s => s.defined ? `${s.defined.name}_${s.defined.version} = ${s.op}` : s.op)
                });
            }
        }
        return paths;
    }
}
exports.TaintTracer = TaintTracer;
//# sourceMappingURL=taint.js.map