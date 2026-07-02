"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const definition_1 = require("./definition");
const callers_1 = require("./callers");
const overrides_1 = require("./overrides");
class NavigationService {
    constructor(repo) {
        this.defResolver = new definition_1.DefinitionResolver(repo);
        this.callersTracker = new callers_1.CallersTracker(repo);
        this.overridesTracer = new overrides_1.OverridesTracer(repo);
    }
    findDefinition(sym) {
        return this.defResolver.findDefinition(sym);
    }
    findCallers(funcFqn) {
        return this.callersTracker.findCallers(funcFqn);
    }
    findCallees(funcFqn) {
        return this.callersTracker.findCallees(funcFqn);
    }
    findImplementations(interfaceFqn) {
        return this.overridesTracer.findImplementations(interfaceFqn);
    }
    findOverrides(methodFqn) {
        return this.overridesTracer.findOverrides(methodFqn);
    }
}
exports.NavigationService = NavigationService;
//# sourceMappingURL=index.js.map