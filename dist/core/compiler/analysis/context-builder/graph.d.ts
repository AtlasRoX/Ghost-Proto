import { IRSymbol } from '../../schema/nodes';
import { Finding } from '../store/evidence';
export interface ContextGraphNode {
    id: string;
    type: 'symbol' | 'finding' | 'path';
    data: any;
}
export interface ContextGraphEdge {
    from: string;
    to: string;
}
export declare class ContextGraph {
    nodes: Map<string, ContextGraphNode>;
    edges: ContextGraphEdge[];
    addNode(node: ContextGraphNode): void;
    addEdge(from: string, to: string): void;
    getSymbols(): IRSymbol[];
    getFindings(): Finding[];
    getPaths(): string[][];
}
//# sourceMappingURL=graph.d.ts.map