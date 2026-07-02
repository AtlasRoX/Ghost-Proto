import { AuditObjective, CandidateFinding, VerificationVote } from '../roles/interface';
import { DefaultPlannerRole } from '../roles/planner';
import { DefaultWorkerRole } from '../roles/worker';
import { DefaultReviewerRole } from '../roles/reviewer';
import { DefaultJudgeRole } from '../roles/judge';
import { ExecutionContext } from '../../context';
import { AgentSession } from '../session';
import { ExecutionDAG } from '../../executor/dag';
import { ExecutionScheduler } from '../../executor/scheduler';
import { ConsensusEngine } from '../consensus';
import { ReportBuilder } from '../report/builder';

export class AgentCoordinator {
  private planner = new DefaultPlannerRole();
  private worker = new DefaultWorkerRole();
  private reviewer = new DefaultReviewerRole();
  private judge = new DefaultJudgeRole();
  private consensus = new ConsensusEngine();
  private scheduler = new ExecutionScheduler();

  public async run(objective: AuditObjective, ctx: ExecutionContext): Promise<string> {
    const session = new AgentSession(`session_${Date.now()}`, objective, ctx);
    session.logTrace(`Initializing session for category: ${objective.category}`);

    // 1. Planning
    const tasks = await this.planner.plan(objective, ctx);
    session.logTrace(`Created task execution plan with ${tasks.length} tasks`);

    const dag = new ExecutionDAG();
    for (const t of tasks) {
      dag.addTask(t);
    }

    // 2. Execution (Scheduler & Worker)
    session.logTrace(`Executing task scheduler...`);
    await this.scheduler.execute(dag, ctx);

    // Run worker logic to aggregate Candidate Findings
    const candidates: CandidateFinding[] = [];
    for (const task of tasks) {
      const taskCandidates = await this.worker.execute(task, ctx);
      candidates.push(...taskCandidates);
    }
    session.candidateFindings = candidates;
    session.logTrace(`Aggregated ${candidates.length} candidate findings from workers`);

    // 3. Reviewer Votes
    const votes: VerificationVote[] = await this.reviewer.review(candidates, ctx);
    session.logTrace(`Collected ${votes.length} verification votes from reviewers`);

    // 4. Judge Decision & Consensus
    const verifiedFindings = this.consensus.resolve(candidates, votes, objective.consensusPolicy);
    session.verifiedFindings = verifiedFindings;
    session.logTrace(`Consensus complete. ${verifiedFindings.length} findings verified`);

    // 5. Report Building
    const report = ReportBuilder.buildMarkdown(verifiedFindings);
    session.logTrace('Execution completed. Report generated.');

    return report;
  }
}
