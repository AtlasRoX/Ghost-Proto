"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextGraph = void 0;
class ContextGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
    }
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    addEdge(from, to) {
        this.edges.push({ from, to });
    }
    getSymbols() {
        return Array.from(this.nodes.values())
            .filter(n => n.type === 'symbol')
            .map(n => n.data);
    }
    getFindings() {
        return Array.from(this.nodes.values())
            .filter(n => n.type === 'finding')
            .map(n => n.data);
    }
    getPaths() {
        return Array.from(this.nodes.values())
            .filter(n => n.type === 'path')
            .map(n => n.data);
    }
}
exports.ContextGraph = ContextGraph;
//# sourceMappingURL=graph.js.map