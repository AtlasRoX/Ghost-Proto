"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerContext = void 0;
class CompilerContext {
    constructor(language, projectRoot, compilerVersion = '2.0.0') {
        this.language = language;
        this.projectRoot = projectRoot;
        this.compilerVersion = compilerVersion;
        this.diagnostics = [];
        this.cache = new Map();
        this.flags = {};
    }
    emit(diagnostic) {
        this.diagnostics.push(diagnostic);
    }
    hasErrors() {
        return this.diagnostics.some(d => d.severity === 'error');
    }
    clearDiagnostics() {
        this.diagnostics = [];
    }
}
exports.CompilerContext = CompilerContext;
//# sourceMappingURL=context.js.map