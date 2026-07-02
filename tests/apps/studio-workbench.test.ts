import { Workbench } from '../../src/apps/studio/workbench';
import { RepositoryExtension } from '../../src/apps/studio/extensions/repository';
import { InvestigationExtension } from '../../src/apps/studio/extensions/investigation';

describe('Studio Workbench Platform', () => {
  it('should boot registry, register views/commands via extensions, and trigger handlers', async () => {
    const workbench = new Workbench();
    await workbench.bootstrap();

    // Activate extensions
    RepositoryExtension.activate(workbench);
    InvestigationExtension.activate(workbench);

    // Verify view registrations
    const sidebarViews = workbench.views.getAll().filter(v => v.panel === 'sidebar');
    expect(sidebarViews.some(v => v.id === 'extension.repository.explorer')).toBe(true);

    const mainViews = workbench.views.getAll().filter(v => v.panel === 'main');
    expect(mainViews.some(v => v.id === 'extension.investigation.workspace')).toBe(true);

    // Verify custom inspector registrations
    const inspectors = workbench.inspectors.getForType('finding');
    expect(inspectors).toHaveLength(1);
    expect(inspectors[0].id).toBe('extension.investigation.finding_inspector');

    // Verify command executions
    const cmdResult = await workbench.commands.execute('repository.index', '/project/root');
    expect(cmdResult).toEqual({ status: 'indexed', path: '/project/root' });

    // Verify global layout switches
    expect(workbench.getActiveLayout()).toBe('normal');
    await workbench.commands.execute('workbench.layout.investigate');
    expect(workbench.getActiveLayout()).toBe('investigation');
  });
});
