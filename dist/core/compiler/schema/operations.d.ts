import { IRNode } from './nodes';
export type IROperator = 'ASSIGN' | 'CALL' | 'BRANCH' | 'LOOP' | 'RETURN' | 'CONSTANT';
export interface IROperation extends IRNode {
    kind: 'Operation';
    op: IROperator;
    target?: string;
    args: string[];
}
//# sourceMappingURL=operations.d.ts.map