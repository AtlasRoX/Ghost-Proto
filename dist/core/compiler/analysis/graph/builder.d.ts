import { RepositoryContext } from '../../repository/context';
import { CallGraphEdge } from './call';
import { DependencyEdge } from './dependency';
import { CFG } from './cfg';
export declare class GraphBuilder {
    static buildGraphs(context: RepositoryContext): {
        callGraph: CallGraphEdge[];
        dependencyGraph: DependencyEdge[];
        cfgs: Map<string, CFG>;
    };
}
//# sourceMappingURL=builder.d.ts.map