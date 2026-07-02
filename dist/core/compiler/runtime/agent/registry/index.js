"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyRegistry = exports.RoleRegistry = void 0;
class RoleRegistry {
    constructor() {
        this.roles = new Map();
    }
    register(name, role) {
        this.roles.set(name, role);
    }
    get(name) {
        return this.roles.get(name);
    }
}
exports.RoleRegistry = RoleRegistry;
class StrategyRegistry {
    constructor() {
        this.strategies = new Map();
    }
    register(name, strategy) {
        this.strategies.set(name, strategy);
    }
    get(name) {
        return this.strategies.get(name);
    }
}
exports.StrategyRegistry = StrategyRegistry;
//# sourceMappingURL=index.js.map