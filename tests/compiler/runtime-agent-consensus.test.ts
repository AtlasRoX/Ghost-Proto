import { ConsensusEngine } from '../../src/core/compiler/runtime/agent/consensus';
import { CandidateFinding, VerificationVote } from '../../src/core/compiler/runtime/agent/roles/interface';
import { Finding } from '../../src/core/compiler/analysis/store/evidence';
import { AgentCoordinator } from '../../src/core/compiler/runtime/agent/coordinator';
import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { AnalysisContext } from '../../src/core/compiler/analysis/context';
import { ExecutionContext } from '../../src/core/compiler/runtime/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Agent Consensus & Coordinator Engine', () => {
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

  const mockFinding: Finding = {
    id: 'f1',
    ruleId: 'GHOST_SQL_INJECTION',
    filePath: 'test.ts',
    severity: 'high',
    message: 'SQL Injection detected',
    evidence: []
  };

  const candidates: CandidateFinding[] = [
    {
      id: 'cand_1',
      finding: mockFinding,
      confidence: 0.9,
      sourceWorker: 'Worker_1'
    }
  ];

  it('should support majority and unanimous consensus voting strategies', () => {
    const engine = new ConsensusEngine();

    // 1. Majority check (1 approve, 1 reject = 50% = majority approved)
    const votesMajority: VerificationVote[] = [
      { candidateFindingId: 'cand_1', voter: 'v1', approved: true, confidence: 0.9 },
      { candidateFindingId: 'cand_1', voter: 'v2', approved: false, confidence: 0.8 }
    ];

    const majorityResult = engine.resolve(candidates, votesMajority, 'majority');
    expect(majorityResult).toHaveLength(1);

    // 2. Unanimous check (1 approve, 1 reject = rejected)
    const unanimousResult = engine.resolve(candidates, votesMajority, 'unanimous');
    expect(unanimousResult).toHaveLength(0);
  });

  it('should coordinate full session pipelines from planner to reports', async () => {
    // Setup symbol with parameter userInput to trigger default rule analyzer
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const index = RepositoryBuilder.build([[sym]]);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);
    const execCtx = new ExecutionContext(repoCtx, analysisCtx);

    const coordinator = new AgentCoordinator();
    const objective = {
      id: 'obj_test',
      category: 'Security',
      description: 'Audit SQL Injection points',
      requiredCapabilities: ['high_reasoning'],
      rulePacks: ['GHOST_SQL_INJECTION'],
      retrievalStrategy: 'default',
      promptProfile: 'default',
      consensusPolicy: 'majority' as const,
      maxCostLimit: 1.0
    };

    const report = await coordinator.run(objective, execCtx);
    expect(report).toContain('# Audit Execution Report');
    expect(report).toContain('Total Verified Findings: 1');
  });
});
