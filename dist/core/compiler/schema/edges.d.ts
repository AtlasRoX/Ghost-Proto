import { IRNode } from './nodes';
export type IREdgeKind = 'CALLS' | 'IMPORTS' | 'USES' | 'OWNS' | 'DEPENDS_ON' | 'READS' | 'WRITES' | 'AUTHENTICATES' | 'SANITIZES' | 'FLOWS_TO' | 'IMPLEMENTS' | 'OVERRIDES';
export interface IREdge extends IRNode {
    kind: 'Edge';
    edgeKind: IREdgeKind;
    fromNodeId: string;
    toNodeId: string;
}
//# sourceMappingURL=edges.d.ts.map