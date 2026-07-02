import { PassManager, CompilerPass } from '../../src/core/compiler/manager';
import { CompilerContext } from '../../src/core/compiler/context';
import { IRNode } from '../../src/core/compiler/schema/nodes';

describe('Pass Manager & DAG Scheduler', () => {
  it('should schedule passes in correct dependency order', () => {
    const manager = new PassManager();

    const passA: CompilerPass = {
      name: 'PassA',
      dependencies: [],
      invalidates: [],
      parallelizable: true,
      execute: async (_ctx, ir) => ir
    };

    const passB: CompilerPass = {
      name: 'PassB',
      dependencies: ['PassA'],
      invalidates: [],
      parallelizable: true,
      execute: async (_ctx, ir) => ir
    };

    manager.registerPass(passB);
    manager.registerPass(passA);

    const schedule = manager.getPassSchedule();
    expect(schedule).toEqual(['PassA', 'PassB']);
  });

  it('should throw an error if circular dependencies are present', () => {
    const manager = new PassManager();

    const passA: CompilerPass = {
      name: 'PassA',
      dependencies: ['PassB'],
      invalidates: [],
      parallelizable: true,
      execute: async (_ctx, ir) => ir
    };

    const passB: CompilerPass = {
      name: 'PassB',
      dependencies: ['PassA'],
      invalidates: [],
      parallelizable: true,
      execute: async (_ctx, ir) => ir
    };

    manager.registerPass(passA);
    manager.registerPass(passB);

    expect(() => manager.getPassSchedule()).toThrow('Circular dependency');
  });
});
