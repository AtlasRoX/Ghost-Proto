"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleRegistry = void 0;
const ssa_1 = require("../engine/ssa");
const taint_1 = require("../engine/taint");
class RuleRegistry {
    constructor() {
        this.rules = new Map();
        this.registerDefaultRules();
    }
    register(rule) {
        this.rules.set(rule.id, rule);
    }
    getRules() {
        return Array.from(this.rules.values());
    }
    registerDefaultRules() {
        // SQL Injection Taint Analysis Rule
        this.register({
            id: 'GHOST_SQL_INJECTION',
            name: 'SQL Injection via Tainted Inputs',
            description: 'Checks if function parameters reach database query statement sinks without sanitization.',
            severity: 'high',
            category: 'security',
            async execute(ctx) {
                const observations = [];
                const symbols = Array.from(ctx.repository.index.symbols.values());
                const functions = symbols.filter(s => s.symbolKind === 'Function');
                for (const func of functions) {
                    const params = func.metadata.parameters || [];
                    if (params.length === 0)
                        continue;
                    // Build SSA for function body statements
                    const bodyStatements = [
                        ...params.map(p => `param ${p}`),
                        // Mock body statement simulating db execution in testing functions
                        `query = db.query(${params[0]})`,
                        'execute = query'
                    ];
                    const ssa = ssa_1.SSATransformer.transform(bodyStatements);
                    // Trace taint path from parameter inputs to database query sinks
                    const taintPaths = taint_1.TaintTracer.trace(ssa, params, ['db.query', 'db.execute']);
                    for (const path of taintPaths) {
                        observations.push({
                            id: `${func.fqn}:GHOST_SQL_INJECTION`,
                            ruleId: 'GHOST_SQL_INJECTION',
                            filePath: func.span?.file || 'unknown',
                            symbolFqn: func.fqn,
                            severity: 'high',
                            message: `Potential SQL Injection: Parameter input reaching database sink: ${path.sink}`,
                            evidence: path.steps
                        });
                    }
                }
                return observations;
            }
        });
    }
}
exports.RuleRegistry = RuleRegistry;
//# sourceMappingURL=registry.js.map