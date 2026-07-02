import { RepositoryContext } from '../../repository/context';
export interface CallGraphEdge {
    callerFqn: string;
    calleeFqn: string;
}
export declare class CallGraphBuilder {
    static build(context: RepositoryContext): CallGraphEdge[];
}
//# sourceMappingURL=call.d.ts.map