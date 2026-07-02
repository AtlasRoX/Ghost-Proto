import { WorkingMemory } from '../../src/core/compiler/runtime/memory/working';

describe('Working Memory Scopes', () => {
  it('should set current task, record steps, and clear correctly on scope disposal', () => {
    const mem = new WorkingMemory();

    mem.setTask('Audit Authentication');
    mem.completeStep('Retrieve auth symbols');
    mem.addSubTask('sub1', 'Trace token check');
    mem.updateSubTaskStatus('sub1', 'active');

    expect(mem.currentTask).toBe('Audit Authentication');
    expect(mem.completedSteps).toContain('Retrieve auth symbols');
    expect(mem.subTasks[0].status).toBe('active');

    mem.clear();
    expect(mem.currentTask).toBeNull();
    expect(mem.completedSteps).toHaveLength(0);
    expect(mem.subTasks).toHaveLength(0);
  });
});
