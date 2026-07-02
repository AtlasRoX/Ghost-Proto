"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportPass = void 0;
class ImportPass {
    constructor() {
        this.name = 'ImportPass';
        this.dependencies = [];
        this.invalidates = [];
        this.parallelizable = true;
    }
    async execute(ctx, ir) {
        const nextIr = [...ir];
        for (const node of nextIr) {
            if (node.kind === 'Symbol') {
                const sym = node;
                if (sym.symbolKind === 'Variable' && sym.metadata.isImport) {
                    ctx.emit({
                        severity: 'info',
                        code: 'INF_IMPORT_RESOLVED',
                        message: `Import symbol ${sym.name} evaluated in compilation context.`,
                        location: sym.span
                    });
                }
            }
        }
        return nextIr;
    }
}
exports.ImportPass = ImportPass;
//# sourceMappingURL=import-pass.js.map