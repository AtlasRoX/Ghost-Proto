import { VariableTracer } from '../../src/core/compiler/analysis/trace/variable';
import { DependencyTracer } from '../../src/core/compiler/analysis/trace/dependency';
import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { RepositoryContext } from '../../src/core/compiler/repository/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Program Analysis Tracers', () => {
  const span: IRSpan = {
    file: 'test.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 10, line: 1, column: 11 }
  };

  const origin: IROrigin = {
    language: 'typescript',
    parser: 'test',
    parserVersion: '1.0'
  };

  it('should trace variable definition and uses in statements', () => {
    const code = [
      'x = 1',
      'y = x + 2',
      'z = 10'
    ];
    const trace = VariableTracer.traceVariable(code, 'x');
    expect(trace).toHaveLength(2); // x = 1 and y = x + 2
  });

  it('should trace import dependency chains between files', () => {
    const spanA = { ...span, file: 'fileA.ts' };
    const spanB = { ...span, file: 'fileB.ts' };
    const spanC = { ...span, file: 'fileC.ts' };

    // fileA imports fileB, fileB imports fileC
    const modA = ImmutableIRBuilder.createSymbol('Module', 'fileA.ts', 'fileA.ts', spanA, origin);
    const impB = ImmutableIRBuilder.createSymbol('Variable', 'b', 'fileA.ts:import:b', spanA, origin, 'fileA.ts', {
      isImport: true,
      resolvedPath: 'fileB.ts'
    });
    
    const modB = ImmutableIRBuilder.createSymbol('Module', 'fileB.ts', 'fileB.ts', spanB, origin);
    const impC = ImmutableIRBuilder.createSymbol('Variable', 'c', 'fileB.ts:import:c', spanB, origin, 'fileB.ts', {
      isImport: true,
      resolvedPath: 'fileC.ts'
    });

    const modC = ImmutableIRBuilder.createSymbol('Module', 'fileC.ts', 'fileC.ts', spanC, origin);

    const index = RepositoryBuilder.build([[modA, impB], [modB, impC], [modC]]);
    const repoCtx = new RepositoryContext(index);
    const depTracer = new DependencyTracer(repoCtx);

    const chain = depTracer.traceDependencyChain('fileA.ts', 'fileC.ts');
    expect(chain).toEqual(['fileA.ts', 'fileB.ts', 'fileC.ts']);
  });
});
