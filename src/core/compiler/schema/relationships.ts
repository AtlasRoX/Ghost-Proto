import { IREdgeKind } from './edges';

export interface IRRelationship {
  kind: IREdgeKind;
  fromFqn: string;
  toFqn: string;
  metadata: Record<string, unknown>;
}
