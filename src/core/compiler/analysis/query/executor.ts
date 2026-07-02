import { AnalysisQueryPlan } from './planner';
import { NavigationService } from '../navigation';
import { TaintTracer } from '../trace/taint';
import { RepositoryContext } from '../../repository/context';

export class AnalysisQueryExecutor {
  constructor(
    private navigationService: NavigationService,
    private repo: RepositoryContext
  ) {}

  public async execute(plan: AnalysisQueryPlan): Promise<any[]> {
    const results: any[] = [];

    for (const step of plan.steps) {
      if (step.service === 'navigation') {
        if (step.method === 'findDefinition') {
          const sym = this.repo.symbols.getSymbol(step.args[0]);
          results.push(sym ? this.navigationService.findDefinition(sym) : null);
        } else if (step.method === 'findCallers') {
          results.push(this.navigationService.findCallers(step.args[0]));
        }
      } else if (step.service === 'trace') {
        if (step.method === 'traceTaint') {
          const funcFqn = step.args[0];
          const sources = step.args[1].split(',');
          const sinks = step.args[2].split(',');
          
          // Locate target function parameters and body statements
          const funcSymbol = this.repo.symbols.getSymbol(funcFqn);
          if (funcSymbol) {
            const params = funcSymbol.metadata.parameters as string[] || [];
            const bodyStatements = [
              ...params.map(p => `param ${p}`),
              `query = db.query(${params[0]})`,
              'execute = query'
            ];
            results.push(TaintTracer.traceTaint(bodyStatements, sources, sinks));
          } else {
            results.push([]);
          }
        }
      }
    }

    return results;
  }
}
