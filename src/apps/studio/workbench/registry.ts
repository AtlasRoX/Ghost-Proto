export interface ContributionView {
  id: string;
  title: string;
  panel: string; // e.g. "sidebar", "main", "bottom"
  render(): string;
}

export interface ContributionCommand {
  id: string;
  title: string;
  handler: (...args: any[]) => Promise<any>;
}

export interface ContributionInspector {
  id: string;
  targetType: string; // e.g. "finding", "symbol"
  render(target: any): string;
}

export class ViewRegistry {
  private views = new Map<string, ContributionView>();

  public register(view: ContributionView): void {
    this.views.set(view.id, view);
  }

  public get(id: string): ContributionView | undefined {
    return this.views.get(id);
  }

  public getAll(): ContributionView[] {
    return Array.from(this.views.values());
  }
}

export class CommandRegistry {
  private commands = new Map<string, ContributionCommand>();

  public register(cmd: ContributionCommand): void {
    this.commands.set(cmd.id, cmd);
  }

  public async execute(id: string, ...args: any[]): Promise<any> {
    const cmd = this.commands.get(id);
    if (!cmd) throw new Error(`Command not found: ${id}`);
    return cmd.handler(...args);
  }

  public getAll(): ContributionCommand[] {
    return Array.from(this.commands.values());
  }
}

export class InspectorRegistry {
  private inspectors = new Map<string, ContributionInspector>();

  public register(inspector: ContributionInspector): void {
    this.inspectors.set(inspector.id, inspector);
  }

  public getForType(type: string): ContributionInspector[] {
    return Array.from(this.inspectors.values()).filter(i => i.targetType === type);
  }
}
