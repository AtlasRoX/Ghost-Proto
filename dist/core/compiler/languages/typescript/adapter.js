"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptLanguageAdapter = void 0;
const parser_1 = require("./parser");
const mapper_1 = require("./mapper");
const resolver_1 = require("./resolver");
class TypeScriptLanguageAdapter {
    constructor() {
        this.languageId = 'typescript';
        this.extensions = ['.ts', '.tsx', '.js', '.jsx'];
        this.capabilities = ['decorators', 'jsx', 'types', 'imports'];
        this.parser = new parser_1.TypeScriptParser();
        this.mapper = new mapper_1.TypeScriptMapper();
        this.resolver = new resolver_1.TypeScriptResolver();
        this.initialized = false;
    }
    async compile(ctx, source, filePath) {
        if (!this.initialized) {
            await this.parser.initialize();
            this.initialized = true;
        }
        const semanticNode = this.parser.parse(ctx, source, filePath);
        const irNodes = this.mapper.map(semanticNode, filePath);
        this.resolver.resolveImports(ctx, irNodes, filePath);
        return irNodes;
    }
}
exports.TypeScriptLanguageAdapter = TypeScriptLanguageAdapter;
//# sourceMappingURL=adapter.js.map