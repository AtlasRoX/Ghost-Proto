"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSATransformer = void 0;
class SSATransformer {
    static transform(statements) {
        const versions = new Map();
        const ssaStatements = [];
        const nextVersion = (name) => {
            const v = (versions.get(name) ?? -1) + 1;
            versions.set(name, v);
            return v;
        };
        const currentVersion = (name) => {
            return versions.get(name) ?? 0;
        };
        for (const stmt of statements) {
            if (stmt.includes('=')) {
                // e.g. "x = y + z" or "x = input"
                const [left, right] = stmt.split('=').map(s => s.trim());
                const leftName = left;
                const rightTokens = right.split(/\s+/);
                const used = [];
                const matches = right.match(/[a-zA-Z_]\w*/g) || [];
                for (const token of matches) {
                    used.push({ name: token, version: currentVersion(token) });
                }
                const defined = { name: leftName, version: nextVersion(leftName) };
                ssaStatements.push({
                    defined,
                    used,
                    op: right
                });
            }
            else if (stmt.startsWith('param ')) {
                const paramName = stmt.substring(6).trim();
                ssaStatements.push({
                    defined: { name: paramName, version: nextVersion(paramName) },
                    used: [],
                    op: 'parameter'
                });
            }
            else {
                // generic expression
                ssaStatements.push({
                    defined: null,
                    used: [],
                    op: stmt
                });
            }
        }
        return ssaStatements;
    }
}
exports.SSATransformer = SSATransformer;
//# sourceMappingURL=ssa.js.map