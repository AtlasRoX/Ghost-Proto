import { WorkerRole, CandidateFinding } from './interface';
import { ExecutionTask } from '../../executor/dag';
import { ExecutionContext } from '../../context';

export class DefaultWorkerRole implements WorkerRole {
  public async execute(task: ExecutionTask, ctx: ExecutionContext): Promise<CandidateFinding[]> {
    ctx.logEvent('AGENT_WORKER_EXECUTE', `Running worker task: ${task.name}`);

    // Fetch findings statically and wrap them as CandidateFindings with confidence scores
    const findings = await ctx.analysis.analyze();
    const candidates: CandidateFinding[] = findings.map(f => ({
      id: `cand_${f.id}`,
      finding: f,
      confidence: f.severity === 'high' ? 0.9 : 0.7,
      sourceWorker: 'DefaultWorker'
    }));

    return candidates;
  }
}
