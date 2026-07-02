"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
class ImportService {
    constructor(index) {
        this.index = index;
    }
    getImports(filePath) {
        return Array.from(this.index.symbols.values()).filter(s => s.span?.file === filePath && s.symbolKind === 'Variable' && s.metadata.isImport);
    }
}
exports.ImportService = ImportService;
//# sourceMappingURL=import.js.map