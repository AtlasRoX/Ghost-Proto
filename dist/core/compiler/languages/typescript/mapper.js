"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptMapper = void 0;
const builder_1 = require("../../model/builder");
class TypeScriptMapper {
    constructor() {
        this.origin = {
            language: 'typescript',
            parser: 'web-tree-sitter',
            parserVersion: '0.24.3'
        };
    }
    map(root, file) {
        const nodes = [];
        // Add module symbol representing the file itself
        const fileSpan = {
            file,
            start: root.span.start,
            end: root.span.end
        };
        const fileSymbol = builder_1.ImmutableIRBuilder.createSymbol('Module', file.substring(file.lastIndexOf('/') + 1), file, fileSpan, this.origin);
        nodes.push(fileSymbol);
        for (const child of root.children) {
            if (child.type === 'function_declaration') {
                const span = {
                    file,
                    start: child.span.start,
                    end: child.span.end
                };
                const params = child.metadata.parameters || [];
                const fqn = `${file}:${child.name}`;
                const sym = builder_1.ImmutableIRBuilder.createSymbol('Function', child.name, fqn, span, this.origin, file, { parameters: params });
                nodes.push(sym);
            }
            else if (child.type === 'import_statement') {
                const span = {
                    file,
                    start: child.span.start,
                    end: child.span.end
                };
                const fqn = `${file}:import:${child.name}`;
                const sym = builder_1.ImmutableIRBuilder.createSymbol('Variable', child.name, fqn, span, this.origin, file, { isImport: true, importPath: child.metadata.path });
                nodes.push(sym);
            }
        }
        return nodes;
    }
}
exports.TypeScriptMapper = TypeScriptMapper;
//# sourceMappingURL=mapper.js.map