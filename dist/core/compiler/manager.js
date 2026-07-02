"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassManager = void 0;
class PassManager {
    constructor() {
        this.passes = new Map();
    }
    registerPass(pass) {
        this.passes.set(pass.name, pass);
    }
    getPassSchedule() {
        const visited = new Set();
        const temp = new Set();
        const order = [];
        const visit = (name) => {
            if (temp.has(name)) {
                throw new Error(`Circular dependency detected in compiler passes: ${name}`);
            }
            if (!visited.has(name)) {
                temp.add(name);
                const pass = this.passes.get(name);
                if (pass) {
                    for (const dep of pass.dependencies) {
                        visit(dep);
                    }
                }
                temp.delete(name);
                visited.add(name);
                order.push(name);
            }
        };
        for (const name of this.passes.keys()) {
            visit(name);
        }
        return order;
    }
    async executePipeline(ctx, initialIr) {
        const schedule = this.getPassSchedule();
        let currentIr = initialIr;
        for (const passName of schedule) {
            const pass = this.passes.get(passName);
            if (pass) {
                currentIr = await pass.execute(ctx, currentIr);
            }
        }
        return currentIr;
    }
}
exports.PassManager = PassManager;
//# sourceMappingURL=manager.js.map