import { AuditObjective, CandidateFinding } from './roles/interface';
import { ExecutionContext } from '../context';
import { Finding } from '../../analysis/store/evidence';
export declare class AgentSession {
    readonly id: string;
    readonly objective: AuditObjective;
    readonly context: ExecutionContext;
    candidateFindings: CandidateFinding[];
    verifiedFindings: Finding[];
    executionTrace: string[];
    constructor(id: string, objective: AuditObjective, context: ExecutionContext);
    logTrace(message: string): void;
}
//# sourceMappingURL=session.d.ts.map