import { AnalysisContext } from '../context';
import { ComplianceReport } from './report';
import { SuppressionRule } from '../suppress/types';
export declare class CompliancePolicyEngine {
    private policy;
    constructor(policyConfigStr: string);
    evaluate(ctx: AnalysisContext, globalSuppressions?: SuppressionRule[]): Promise<ComplianceReport>;
}
//# sourceMappingURL=engine.d.ts.map