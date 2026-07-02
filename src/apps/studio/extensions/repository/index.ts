import { Workbench } from '../../workbench';

export class RepositoryExtension {
  public static activate(workbench: Workbench): void {
    // Register Repository view
    workbench.views.register({
      id: 'extension.repository.explorer',
      title: 'Repository Explorer',
      panel: 'sidebar',
      render: () => {
        return '<RepositoryExplorer />';
      }
    });

    // Register active commands
    workbench.commands.register({
      id: 'repository.index',
      title: 'Index Repository Codebase',
      handler: async (repoPath: string) => {
        return { status: 'indexed', path: repoPath };
      }
    });
  }
}
