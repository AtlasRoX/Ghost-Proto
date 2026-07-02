"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataService = void 0;
class MetadataService {
    constructor(index) {
        this.index = index;
    }
    getFilePaths() {
        return Array.from(this.index.filePaths);
    }
}
exports.MetadataService = MetadataService;
//# sourceMappingURL=metadata.js.map