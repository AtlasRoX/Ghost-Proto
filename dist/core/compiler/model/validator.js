"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhostIRValidator = void 0;
class GhostIRValidator {
    static validate(ctx, ir, level) {
        if (level >= 1) {
            this.validateLevel1(ctx, ir);
        }
        if (level >= 2) {
            this.validateLevel2(ctx, ir);
        }
        if (level >= 3) {
            this.validateLevel3(ctx, ir);
        }
        if (level >= 4) {
            this.validateLevel4(ctx, ir);
        }
        return !ctx.hasErrors();
    }
    static validateLevel1(ctx, ir) {
        for (const node of ir) {
            if (!node.id || !node.kind || !node.span || !node.origin) {
                ctx.emit({
                    severity: 'error',
                    code: 'ERR_SCHEMA_L1',
                    message: `Node of type ${node.kind || 'unknown'} has missing required schema fields.`
                });
            }
        }
    }
    static validateLevel2(ctx, ir) {
        const nodeIds = new Set(ir.map(n => n.id));
        for (const node of ir) {
            if (node.kind === 'Edge') {
                const edge = node;
                if (!nodeIds.has(edge.fromNodeId)) {
                    ctx.emit({
                        severity: 'error',
                        code: 'ERR_REF_INTEGRITY_L2',
                        message: `Edge ${edge.id} references missing source node ${edge.fromNodeId}.`,
                        location: edge.span
                    });
                }
                if (!nodeIds.has(edge.toNodeId)) {
                    ctx.emit({
                        severity: 'error',
                        code: 'ERR_REF_INTEGRITY_L2',
                        message: `Edge ${edge.id} references missing target node ${edge.toNodeId}.`,
                        location: edge.span
                    });
                }
            }
        }
    }
    static validateLevel3(ctx, ir) {
        // Check that nested symbols reference parent symbols correctly
        const symbolMap = new Map();
        for (const node of ir) {
            if (node.kind === 'Symbol') {
                const sym = node;
                symbolMap.set(sym.fqn, sym);
            }
        }
        for (const sym of symbolMap.values()) {
            if (sym.parentFqn && !symbolMap.has(sym.parentFqn)) {
                ctx.emit({
                    severity: 'warning',
                    code: 'WARN_SEMANTIC_L3',
                    message: `Symbol ${sym.fqn} references parent ${sym.parentFqn} which is not declared in this compilation unit.`,
                    location: sym.span
                });
            }
        }
    }
    static validateLevel4(ctx, ir) {
        // Verify no circular parent hierarchy relationships
        const symbolMap = new Map();
        for (const node of ir) {
            if (node.kind === 'Symbol') {
                const sym = node;
                symbolMap.set(sym.fqn, sym);
            }
        }
        for (const sym of symbolMap.values()) {
            let current = sym;
            const seen = new Set();
            while (current.parentFqn) {
                if (seen.has(current.parentFqn)) {
                    ctx.emit({
                        severity: 'error',
                        code: 'ERR_OPT_SAFETY_L4',
                        message: `Circular parent relationship hierarchy detected around symbol ${sym.fqn}.`,
                        location: sym.span
                    });
                    break;
                }
                seen.add(current.parentFqn);
                const parent = symbolMap.get(current.parentFqn);
                if (!parent)
                    break;
                current = parent;
            }
        }
    }
}
exports.GhostIRValidator = GhostIRValidator;
//# sourceMappingURL=validator.js.map