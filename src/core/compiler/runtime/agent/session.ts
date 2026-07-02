import { AuditObjective, CandidateFinding } from './roles/interface';
import { ExecutionContext } from '../context';
import { Finding } from '../../analysis/store/evidence';

export class AgentSession {
  public candidateFindings: CandidateFinding[] = [];
  public verifiedFindings: Finding[] = [];
  public executionTrace: string[] = [];

  constructor(
    public readonly id: string,
    public readonly objective: AuditObjective,
    public readonly context: ExecutionContext
  ) {}

  public logTrace(message: string): void {
    this.executionTrace.push(`[${new Date().toISOString()}] ${message}`);
  }
}
