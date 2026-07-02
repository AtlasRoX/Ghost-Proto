import { RepositoryIndex } from '../index';
import { IREdge } from '../../schema/edges';

export class ReferenceService {
  constructor(private index: RepositoryIndex) {}

  public getReferencesTo(nodeId: string): IREdge[] {
    return this.index.edges.filter(edge => edge.toNodeId === nodeId);
  }

  public getReferencesFrom(nodeId: string): IREdge[] {
    return this.index.edges.filter(edge => edge.fromNodeId === nodeId);
  }
}
