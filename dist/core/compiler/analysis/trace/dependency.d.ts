import { RepositoryContext } from '../../repository/context';
export declare class DependencyTracer {
    private repo;
    constructor(repo: RepositoryContext);
    traceDependencyChain(fromFile: string, toFile: string): string[] | null;
}
//# sourceMappingURL=dependency.d.ts.map