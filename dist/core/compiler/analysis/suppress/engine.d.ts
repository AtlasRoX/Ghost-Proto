import { Finding } from '../store/evidence';
import { SuppressionRule } from './types';
export declare class FindingSuppressionEngine {
    private globalRules;
    constructor(globalSuppressions?: SuppressionRule[]);
    filterSuppressions(findings: Finding[]): {
        active: Finding[];
        suppressed: {
            findingId: string;
            reason: string;
        }[];
    };
}
//# sourceMappingURL=engine.d.ts.map