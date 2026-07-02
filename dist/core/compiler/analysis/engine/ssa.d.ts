export interface SSAVariable {
    name: string;
    version: number;
}
export interface SSAStatement {
    defined: SSAVariable | null;
    used: SSAVariable[];
    op: string;
}
export declare class SSATransformer {
    static transform(statements: string[]): SSAStatement[];
}
//# sourceMappingURL=ssa.d.ts.map