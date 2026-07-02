import { SSAStatement } from './ssa';
export interface TaintPath {
    source: string;
    sink: string;
    steps: string[];
}
export declare class TaintTracer {
    static trace(ssaStatements: SSAStatement[], sources: string[], sinks: string[]): TaintPath[];
}
//# sourceMappingURL=taint.d.ts.map