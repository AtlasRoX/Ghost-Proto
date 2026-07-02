import { IRNode } from './nodes';
export type IRScopeKind = 'Global' | 'Module' | 'Class' | 'Function' | 'Block';
export interface IRScope extends IRNode {
    kind: 'Scope';
    scopeKind: IRScopeKind;
    parentScopeId?: string;
    declaredSymbolIds: string[];
}
//# sourceMappingURL=scopes.d.ts.map