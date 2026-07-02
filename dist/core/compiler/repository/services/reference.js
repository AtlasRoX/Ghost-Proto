"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceService = void 0;
class ReferenceService {
    constructor(index) {
        this.index = index;
    }
    getReferencesTo(nodeId) {
        return this.index.edges.filter(edge => edge.toNodeId === nodeId);
    }
    getReferencesFrom(nodeId) {
        return this.index.edges.filter(edge => edge.fromNodeId === nodeId);
    }
}
exports.ReferenceService = ReferenceService;
//# sourceMappingURL=reference.js.map