import { RepositoryContext } from '../../repository/context';
export interface DependencyEdge {
    fromModule: string;
    toModule: string;
}
export declare class DependencyGraphBuilder {
    static build(context: RepositoryContext): DependencyEdge[];
}
//# sourceMappingURL=dependency.d.ts.map