import { RepositoryContext } from '../../repository/context';
import { IRSymbol } from '../../schema/nodes';
import { DefinitionResolver } from './definition';
import { CallersTracker } from './callers';
import { OverridesTracer } from './overrides';

export class NavigationService {
  private defResolver: DefinitionResolver;
  private callersTracker: CallersTracker;
  private overridesTracer: OverridesTracer;

  constructor(repo: RepositoryContext) {
    this.defResolver = new DefinitionResolver(repo);
    this.callersTracker = new CallersTracker(repo);
    this.overridesTracer = new OverridesTracer(repo);
  }

  public findDefinition(sym: IRSymbol): IRSymbol | null {
    return this.defResolver.findDefinition(sym);
  }

  public findCallers(funcFqn: string): IRSymbol[] {
    return this.callersTracker.findCallers(funcFqn);
  }

  public findCallees(funcFqn: string): IRSymbol[] {
    return this.callersTracker.findCallees(funcFqn);
  }

  public findImplementations(interfaceFqn: string): IRSymbol[] {
    return this.overridesTracer.findImplementations(interfaceFqn);
  }

  public findOverrides(methodFqn: string): IRSymbol[] {
    return this.overridesTracer.findOverrides(methodFqn);
  }
}
