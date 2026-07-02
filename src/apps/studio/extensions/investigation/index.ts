import { Workbench } from '../../workbench';

export class InvestigationExtension {
  public static activate(workbench: Workbench): void {
    // Register visual workspaces
    workbench.views.register({
      id: 'extension.investigation.workspace',
      title: 'Investigation Panel',
      panel: 'main',
      render: () => {
        return '<InvestigationWorkspace />';
      }
    });

    // Register Inspector panels
    workbench.inspectors.register({
      id: 'extension.investigation.finding_inspector',
      targetType: 'finding',
      render: (finding: any) => {
        return `Finding Inspector: ${finding.ruleId}`;
      }
    });
  }
}
