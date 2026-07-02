import { RepositoryBuilder } from '../../src/core/compiler/repository/builder';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';
import { IRNode, IRSymbol } from '../../src/core/compiler/schema/nodes';

describe('RepositoryBuilder', () => {
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

  it('should merge multiple compilation units and link cross-file imports', () => {
    // Unit A defines module A
    const modA = ImmutableIRBuilder.createSymbol('Module', 'modA.ts', 'modA.ts', span, origin);
    const unitA: IRNode[] = [modA];

    // Unit B defines module B and imports A
    const modB = ImmutableIRBuilder.createSymbol('Module', 'modB.ts', 'modB.ts', span, origin);
    const impA = ImmutableIRBuilder.createSymbol('Variable', 'db', 'modB.ts:import:db', span, origin, 'modB.ts', {
      isImport: true,
      importPath: './modA'
    });
    // Pretend import resolver resolved './modA' to 'modA.ts'
    impA.metadata.resolvedPath = 'modA.ts';
    const unitB: IRNode[] = [modB, impA];

    const index = RepositoryBuilder.build([unitA, unitB]);

    // Check symbols are present
    expect(index.getSymbol('modA.ts')).toBeDefined();
    expect(index.getSymbol('modB.ts')).toBeDefined();
    expect(index.getSymbol('modB.ts:import:db')).toBeDefined();

    // Verify cross-file target symbol ID is linked
    const resolvedImp = index.getSymbol('modB.ts:import:db') as IRSymbol;
    expect(resolvedImp.metadata.targetSymbolId).toBe(modA.id);
  });
});
