import { RetrievalPlan } from './planner';
import { AnalysisContext } from '../context';
import { IRSymbol } from '../../schema/nodes';
import { Finding } from '../store/evidence';
import { DependencyTracer } from '../trace/dependency';

export interface RetrievedEvidenceSet {
  symbols: IRSymbol[];
  findings: Finding[];
  paths: string[][];
}

export class RetrievalExecutor {
  constructor(private ctx: AnalysisContext) {}

  public async execute(plan: RetrievalPlan): Promise<RetrievedEvidenceSet> {
    const symbolsSet = new Map<string, IRSymbol>();
    const findingsList: Finding[] = [];
    const pathsList: string[][] = [];

    const allSymbols = Array.from(this.ctx.repository.index.symbols.values());
    const depTracer = new DependencyTracer(this.ctx.repository);

    for (const step of plan.steps) {
      if (step.action === 'FetchSymbols') {
        const fqns = step.args[0] as string[];
        for (const fqn of fqns) {
          const sym = allSymbols.find(s => s.fqn === fqn);
          if (sym) symbolsSet.set(sym.id, sym);
        }
      } else if (step.action === 'FetchFindings') {
        const files = step.args[0] as string[];
        const allFindings = this.ctx.evidenceStore.getFindings();
        for (const finding of allFindings) {
          if (files.includes(finding.filePath)) {
            findingsList.push(finding);
            // Also retrieve associated symbol if present
            if (finding.symbolFqn) {
              const sym = allSymbols.find(s => s.fqn === finding.symbolFqn);
              if (sym) symbolsSet.set(sym.id, sym);
            }
          }
        }
      } else if (step.action === 'FetchPaths') {
        const files = step.args[0] as string[];
        if (files.length >= 2) {
          const chain = depTracer.traceDependencyChain(files[0], files[1]);
          if (chain) pathsList.push(chain);
        }
      }
    }

    return {
      symbols: Array.from(symbolsSet.values()),
      findings: findingsList,
      paths: pathsList
    };
  }
}
