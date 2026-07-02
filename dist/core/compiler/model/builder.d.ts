import { IRSymbol, IRSymbolKind } from '../schema/nodes';
import { IRSpan, IROrigin } from '../schema/metadata';
import { IREdge, IREdgeKind } from '../schema/edges';
export declare class ImmutableIRBuilder {
    static createSymbol(symbolKind: IRSymbolKind, name: string, fqn: string, span: IRSpan, origin: IROrigin, parentFqn?: string, metadata?: Record<string, unknown>): IRSymbol;
    static createEdge(edgeKind: IREdgeKind, fromNodeId: string, toNodeId: string, span: IRSpan, origin: IROrigin, metadata?: Record<string, unknown>): IREdge;
}
//# sourceMappingURL=builder.d.ts.map