import { DefaultPlannerRole } from '../../src/core/compiler/runtime/agent/roles/planner';
import { DefaultWorkerRole } from '../../src/core/compiler/runtime/agent/roles/worker';
import { DefaultReviewerRole } from '../../src/core/compiler/runtime/agent/roles/reviewer';
import { DefaultJudgeRole } from '../../src/core/compiler/runtime/agent/roles/judge';
import { AuditObjective, CandidateFinding } from '../../src/core/compiler/runtime/agent/roles/interface';
import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ExecutionContext } from '../../src/core/compiler/runtime/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Agent Roles Framework', () => {
  const span: IRSpan = {
    file: 'test.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 10, line: 1, column: 11 }
  };

  const origin: IROrigin = {
    language: 'typescript',
    parser: 'test',
    parserVersion: '1.0'
  };

  const objective: AuditObjective = {
    id: 'obj1',
    category: 'Security',
    description: 'Audit project security',
    requiredCapabilities: ['high_reasoning'],
    rulePacks: ['GHOST_SQL_INJECTION'],
    retrievalStrategy: 'default',
    promptProfile: 'default',
    consensusPolicy: 'majority',
    maxCostLimit: 1.0
  };

  it('should plan, execute, review, and judge findings using stateless capability roles', async () => {
    // Setup execution context with a parameter to trigger the rule observation
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const index = RepositoryBuilder.build([[sym]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);
    const execCtx = new ExecutionContext(repoCtx, analysisCtx);

    const planner = new DefaultPlannerRole();
    const worker = new DefaultWorkerRole();
    const reviewer = new DefaultReviewerRole();
    const judge = new DefaultJudgeRole();

    // 1. Plan
    const tasks = await planner.plan(objective, execCtx);
    expect(tasks).toHaveLength(1);

    // 2. Execute
    const candidates = await worker.execute(tasks[0], execCtx);
    expect(candidates).toBeDefined();

    // 3. Review
    const votes = await reviewer.review(candidates, execCtx);
    expect(votes).toHaveLength(candidates.length);

    // 4. Decide
    const finalized = await judge.decide(candidates, votes, objective.consensusPolicy);
    expect(finalized).toBeDefined();
  });
});
