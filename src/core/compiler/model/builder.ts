import crypto from 'crypto';
import { IRNode, IRSymbol, IRSymbolKind } from '../schema/nodes';
import { IRSpan, IROrigin } from '../schema/metadata';
import { IREdge, IREdgeKind } from '../schema/edges';

export class ImmutableIRBuilder {
  public static createSymbol(
    symbolKind: IRSymbolKind,
    name: string,
    fqn: string,
    span: IRSpan,
    origin: IROrigin,
    parentFqn?: string,
    metadata: Record<string, unknown> = {}
  ): IRSymbol {
    const rawContent = `${symbolKind}:${fqn}:${parentFqn || ''}:${JSON.stringify(origin)}:${JSON.stringify(metadata)}`;
    const id = crypto.createHash('sha256').update(rawContent).digest('hex');

    return {
      id,
      kind: 'Symbol',
      symbolKind,
      name,
      fqn,
      parentFqn,
      version: 1,
      span,
      origin,
      metadata
    };
  }

  public static createEdge(
    edgeKind: IREdgeKind,
    fromNodeId: string,
    toNodeId: string,
    span: IRSpan,
    origin: IROrigin,
    metadata: Record<string, unknown> = {}
  ): IREdge {
    const rawContent = `${edgeKind}:${fromNodeId}:${toNodeId}`;
    const id = crypto.createHash('sha256').update(rawContent).digest('hex');

    return {
      id,
      kind: 'Edge',
      edgeKind,
      fromNodeId,
      toNodeId,
      version: 1,
      span,
      origin,
      metadata
    };
  }
}
