import { RepositoryIndex } from '../index';
import { IREdge } from '../../schema/edges';
export declare class ReferenceService {
    private index;
    constructor(index: RepositoryIndex);
    getReferencesTo(nodeId: string): IREdge[];
    getReferencesFrom(nodeId: string): IREdge[];
}
//# sourceMappingURL=reference.d.ts.map