import { IRSymbol } from '../schema/nodes';
import { IREdge } from '../schema/edges';
export interface RepositoryMetrics {
    symbolCount: number;
    moduleCount: number;
    importCount: number;
    referenceCount: number;
}
export declare class RepositoryIndex {
    symbols: Map<string, IRSymbol>;
    edges: IREdge[];
    filePaths: Set<string>;
    addSymbol(sym: IRSymbol): void;
    getSymbol(fqn: string): IRSymbol | undefined;
    getMetrics(): RepositoryMetrics;
    diff(other: RepositoryIndex): {
        added: string[];
        deleted: string[];
        modified: string[];
    };
}
//# sourceMappingURL=index.d.ts.map