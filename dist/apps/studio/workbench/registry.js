"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectorRegistry = exports.CommandRegistry = exports.ViewRegistry = void 0;
class ViewRegistry {
    constructor() {
        this.views = new Map();
    }
    register(view) {
        this.views.set(view.id, view);
    }
    get(id) {
        return this.views.get(id);
    }
    getAll() {
        return Array.from(this.views.values());
    }
}
exports.ViewRegistry = ViewRegistry;
class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }
    register(cmd) {
        this.commands.set(cmd.id, cmd);
    }
    async execute(id, ...args) {
        const cmd = this.commands.get(id);
        if (!cmd)
            throw new Error(`Command not found: ${id}`);
        return cmd.handler(...args);
    }
    getAll() {
        return Array.from(this.commands.values());
    }
}
exports.CommandRegistry = CommandRegistry;
class InspectorRegistry {
    constructor() {
        this.inspectors = new Map();
    }
    register(inspector) {
        this.inspectors.set(inspector.id, inspector);
    }
    getForType(type) {
        return Array.from(this.inspectors.values()).filter(i => i.targetType === type);
    }
}
exports.InspectorRegistry = InspectorRegistry;
//# sourceMappingURL=registry.js.map