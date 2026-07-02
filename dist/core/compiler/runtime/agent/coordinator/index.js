"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCoordinator = void 0;
const planner_1 = require("../roles/planner");
const worker_1 = require("../roles/worker");
const reviewer_1 = require("../roles/reviewer");
const judge_1 = require("../roles/judge");
const session_1 = require("../session");
const dag_1 = require("../../executor/dag");
const scheduler_1 = require("../../executor/scheduler");
const consensus_1 = require("../consensus");
const builder_1 = require("../report/builder");
class AgentCoordinator {
    constructor() {
        this.planner = new planner_1.DefaultPlannerRole();
        this.worker = new worker_1.DefaultWorkerRole();
        this.reviewer = new reviewer_1.DefaultReviewerRole();
        this.judge = new judge_1.DefaultJudgeRole();
        this.consensus = new consensus_1.ConsensusEngine();
        this.scheduler = new scheduler_1.ExecutionScheduler();
    }
    async run(objective, ctx) {
        const session = new session_1.AgentSession(`session_${Date.now()}`, objective, ctx);
        session.logTrace(`Initializing session for category: ${objective.category}`);
        // 1. Planning
        const tasks = await this.planner.plan(objective, ctx);
        session.logTrace(`Created task execution plan with ${tasks.length} tasks`);
        const dag = new dag_1.ExecutionDAG();
        for (const t of tasks) {
            dag.addTask(t);
        }
        // 2. Execution (Scheduler & Worker)
        session.logTrace(`Executing task scheduler...`);
        await this.scheduler.execute(dag, ctx);
        // Run worker logic to aggregate Candidate Findings
        const candidates = [];
        for (const task of tasks) {
            const taskCandidates = await this.worker.execute(task, ctx);
            candidates.push(...taskCandidates);
        }
        session.candidateFindings = candidates;
        session.logTrace(`Aggregated ${candidates.length} candidate findings from workers`);
        // 3. Reviewer Votes
        const votes = await this.reviewer.review(candidates, ctx);
        session.logTrace(`Collected ${votes.length} verification votes from reviewers`);
        // 4. Judge Decision & Consensus
        const verifiedFindings = this.consensus.resolve(candidates, votes, objective.consensusPolicy);
        session.verifiedFindings = verifiedFindings;
        session.logTrace(`Consensus complete. ${verifiedFindings.length} findings verified`);
        // 5. Report Building
        const report = builder_1.ReportBuilder.buildMarkdown(verifiedFindings);
        session.logTrace('Execution completed. Report generated.');
        return report;
    }
}
exports.AgentCoordinator = AgentCoordinator;
//# sourceMappingURL=index.js.map