"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptParser = void 0;
const TreeSitter = __importStar(require("web-tree-sitter"));
class TypeScriptParser {
    constructor() {
        this.parser = null;
        this.wasmLoaded = false;
    }
    async initialize(wasmPath) {
        try {
            await TreeSitter.Parser.init();
            this.parser = new TreeSitter.Parser();
            if (wasmPath) {
                const lang = await TreeSitter.Language.load(wasmPath);
                this.parser.setLanguage(lang);
                this.wasmLoaded = true;
            }
        }
        catch {
            // WASM load failed, fallback parser will be used
            this.wasmLoaded = false;
        }
    }
    parse(ctx, source, filePath) {
        if (this.parser && this.wasmLoaded) {
            try {
                const tree = this.parser.parse(source);
                if (tree && tree.rootNode) {
                    return this.mapTreeSitterToSemanticNode(tree.rootNode, filePath);
                }
            }
            catch (e) {
                ctx.emit({
                    severity: 'warning',
                    code: 'WARN_CST_PARSER_FALLBACK',
                    message: `Tree-sitter parse failed, falling back: ${e.message}`
                });
            }
        }
        // Fallback: Pure Lexical / Token AST generator
        return this.fallbackParse(source, filePath);
    }
    mapTreeSitterToSemanticNode(node, file) {
        const start = node.startPosition;
        const end = node.endPosition;
        const children = [];
        for (let i = 0; i < node.namedChildCount; i++) {
            const child = node.namedChild(i);
            if (child) {
                children.push(this.mapTreeSitterToSemanticNode(child, file));
            }
        }
        return {
            type: node.type,
            name: node.type === 'identifier' ? node.text : '',
            fqn: `${file}:${node.type}:${start.row}_${start.column}`,
            span: {
                start: { offset: node.startIndex, line: start.row + 1, column: start.column + 1 },
                end: { offset: node.endIndex, line: end.row + 1, column: end.column + 1 }
            },
            children,
            metadata: { text: node.text }
        };
    }
    fallbackParse(source, file) {
        // Generate a structured Semantic AST based on JS/TS declarations:
        // Extract functions, methods, imports, classes, and variables.
        const root = {
            type: 'program',
            name: 'root',
            fqn: `${file}:program:0_0`,
            span: { start: { offset: 0, line: 1, column: 1 }, end: { offset: source.length, line: 1, column: 1 } },
            children: [],
            metadata: {}
        };
        // Detect imports
        const importRegex = /import\s+({[^}]+}|[^{;\s]+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(source)) !== null) {
            const offset = match.index;
            root.children.push({
                type: 'import_statement',
                name: match[1].trim(),
                fqn: `${file}:import:${offset}`,
                span: {
                    start: { offset, line: 1, column: 1 },
                    end: { offset: offset + match[0].length, line: 1, column: match[0].length }
                },
                children: [],
                metadata: { path: match[2] }
            });
        }
        // Detect functions
        const funcRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*{/g;
        while ((match = funcRegex.exec(source)) !== null) {
            const offset = match.index;
            const params = match[2].split(',').map(p => p.trim()).filter(Boolean);
            root.children.push({
                type: 'function_declaration',
                name: match[1],
                fqn: `${file}:${match[1]}:${offset}`,
                span: {
                    start: { offset, line: 1, column: 1 },
                    end: { offset: offset + match[0].length, line: 1, column: match[0].length }
                },
                children: [],
                metadata: { parameters: params }
            });
        }
        return root;
    }
}
exports.TypeScriptParser = TypeScriptParser;
//# sourceMappingURL=parser.js.map