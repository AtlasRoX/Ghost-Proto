import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';
export declare class OverridesTracer {
    private repo;
    constructor(repo: RepositoryContext);
    findImplementations(interfaceFqn: string): IRSymbol[];
    findOverrides(methodFqn: string): IRSymbol[];
}
//# sourceMappingURL=overrides.d.ts.map