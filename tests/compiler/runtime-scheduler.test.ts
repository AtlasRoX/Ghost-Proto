import { ExecutionPlanner } from '../../src/core/compiler/runtime/executor/planner';
import { ExecutionScheduler } from '../../src/core/compiler/runtime/executor/scheduler';
import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ExecutionContext } from '../../src/core/compiler/runtime/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Execution Scheduler', () => {
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

  it('should compile plans and execute sequential worker tasks with retry handling', async () => {
    // Symbol configured with parameters to trigger mock checks in RuleWorker
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const index = RepositoryBuilder.build([[sym]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);
    const execCtx = new ExecutionContext(repoCtx, analysisCtx);

    const planner = ExecutionPlanner.plan('AuditSecurity');
    const scheduler = new ExecutionScheduler();

    await scheduler.execute(planner, execCtx);

    // Verify task completion states
    expect(execCtx.workingMemory.completedSteps).toContain('Run Dataflow Analysis');
    expect(execCtx.workingMemory.completedSteps).toContain('Execute SQL Injection Rules');

    // Verify events recorded
    const eventTypes = execCtx.eventLog.map(e => e.type);
    expect(eventTypes).toContain('SCHEDULER_START');
    expect(eventTypes).toContain('TASK_SUCCESS');
    expect(eventTypes).toContain('SCHEDULER_COMPLETED');
  });
});
