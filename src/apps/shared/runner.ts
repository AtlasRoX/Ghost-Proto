import { AuditObjective } from '../../core/compiler/runtime/agent/roles/interface';
import { RepositoryBuilder } from '../../core/compiler/repository/builder';
import { RepositoryContext } from '../../core/compiler/repository/context';
import { AnalysisContext } from '../../core/compiler/analysis/context';
import { ExecutionContext } from '../../core/compiler/runtime/context';
import { AgentCoordinator } from '../../core/compiler/runtime/agent/coordinator';
import { IRSymbol } from '../../core/compiler/schema/nodes';

export class ApplicationRunner {
  public static async runAudit(
    objective: AuditObjective,
    compilationUnits: IRSymbol[][]
  ): Promise<string> {
    const index = RepositoryBuilder.build(compilationUnits);
    const repoCtx = new RepositoryContext(index);
    const analysisCtx = new AnalysisContext(repoCtx);
    const execCtx = new ExecutionContext(repoCtx, analysisCtx);

    const coordinator = new AgentCoordinator();
    const report = await coordinator.run(objective, execCtx);

    // Dispose context to free up memories
    execCtx.dispose();

    return report;
  }
}
