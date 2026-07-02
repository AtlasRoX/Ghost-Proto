import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';
export declare class DefinitionResolver {
    private repo;
    constructor(repo: RepositoryContext);
    findDefinition(sym: IRSymbol): IRSymbol | null;
}
//# sourceMappingURL=definition.d.ts.map