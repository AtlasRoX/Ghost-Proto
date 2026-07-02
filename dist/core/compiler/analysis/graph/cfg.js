"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CFGBuilder = void 0;
class CFGBuilder {
    static build(func) {
        const blocks = new Map();
        const entryBlockId = `${func.fqn}:block_0`;
        // Simple CFG parser: Deconstruct statements
        const parameters = func.metadata.parameters || [];
        const statements = parameters.map(p => `param ${p}`);
        // Add dummy execution block
        const block = {
            id: entryBlockId,
            label: 'entry',
            statements: [...statements, 'execute function body'],
            successors: [],
            predecessors: []
        };
        blocks.set(entryBlockId, block);
        return {
            entryBlockId,
            blocks
        };
    }
}
exports.CFGBuilder = CFGBuilder;
//# sourceMappingURL=cfg.js.map