import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';
export declare class NavigationService {
    private defResolver;
    private callersTracker;
    private overridesTracer;
    constructor(repo: RepositoryContext);
    findDefinition(sym: IRSymbol): IRSymbol | null;
    findCallers(funcFqn: string): IRSymbol[];
    findCallees(funcFqn: string): IRSymbol[];
    findImplementations(interfaceFqn: string): IRSymbol[];
    findOverrides(methodFqn: string): IRSymbol[];
}
//# sourceMappingURL=index.d.ts.map