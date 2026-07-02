import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';
export declare class CallersTracker {
    private repo;
    constructor(repo: RepositoryContext);
    findCallers(funcFqn: string): IRSymbol[];
    findCallees(funcFqn: string): IRSymbol[];
}
//# sourceMappingURL=callers.d.ts.map