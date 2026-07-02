import { RuleRegistry } from './registry';
import { Observation } from './types';
import { AnalysisContext } from '../context';
export declare class RuleEngine {
    private registry;
    constructor(registry: RuleRegistry);
    runAll(ctx: AnalysisContext): Promise<Observation[]>;
}
//# sourceMappingURL=engine.d.ts.map