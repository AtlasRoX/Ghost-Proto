"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerAPI = void 0;
const context_1 = require("./context");
const registry_1 = require("./registry");
const manager_1 = require("./manager");
const validator_1 = require("./model/validator");
const serializer_1 = require("./model/serializer");
class CompilerAPI {
    constructor() {
        this.registry = new registry_1.LanguageRegistry();
        this.passManager = new manager_1.PassManager();
        this.serializer = new serializer_1.JSONSerializer();
    }
    registerLanguage(adapter) {
        this.registry.registerAdapter(adapter);
    }
    registerPass(pass) {
        this.passManager.registerPass(pass);
    }
    setSerializer(serializer) {
        this.serializer = serializer;
    }
    async compileFile(filePath, source, projectRoot, languageId) {
        const ctx = new context_1.CompilerContext(languageId, projectRoot);
        const adapter = this.registry.getAdapterForExtension(filePath.substring(filePath.lastIndexOf('.')));
        if (!adapter) {
            ctx.emit({
                severity: 'error',
                code: 'ERR_LANG_NOT_REGISTERED',
                message: `No language adapter registered for file extension: ${filePath}`
            });
            return {
                success: false,
                ir: [],
                diagnostics: ctx.diagnostics,
                serialized: ''
            };
        }
        try {
            const initialIr = await adapter.compile(ctx, source, filePath);
            const optimizedIr = await this.passManager.executePipeline(ctx, initialIr);
            // Verify the final compiled product through L1-L4 validator checks
            const valid = validator_1.GhostIRValidator.validate(ctx, optimizedIr, 4);
            if (!valid || ctx.hasErrors()) {
                return {
                    success: false,
                    ir: [],
                    diagnostics: ctx.diagnostics,
                    serialized: ''
                };
            }
            const serialized = this.serializer.serialize(optimizedIr);
            return {
                success: true,
                ir: optimizedIr,
                diagnostics: ctx.diagnostics,
                serialized
            };
        }
        catch (e) {
            ctx.emit({
                severity: 'error',
                code: 'ERR_UNCAUGHT_COMPILER_EXCEPTION',
                message: `Uncaught exception during compilation: ${e.message || e}`
            });
            return {
                success: false,
                ir: [],
                diagnostics: ctx.diagnostics,
                serialized: ''
            };
        }
    }
}
exports.CompilerAPI = CompilerAPI;
//# sourceMappingURL=api.js.map