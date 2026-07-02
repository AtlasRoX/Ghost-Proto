import { ViewRegistry, CommandRegistry, InspectorRegistry } from './registry';

export class Workbench {
  public views = new ViewRegistry();
  public commands = new CommandRegistry();
  public inspectors = new InspectorRegistry();
  public activeLayout: 'normal' | 'investigation' = 'normal';

  public async bootstrap(): Promise<void> {
    // Register default global commands
    this.commands.register({
      id: 'workbench.layout.reset',
      title: 'Reset Workbench Layout',
      handler: async () => {
        this.activeLayout = 'normal';
      }
    });

    this.commands.register({
      id: 'workbench.layout.investigate',
      title: 'Switch to Investigation Mode',
      handler: async () => {
        this.activeLayout = 'investigation';
      }
    });
  }

  public getActiveLayout(): 'normal' | 'investigation' {
    return this.activeLayout;
  }
}
