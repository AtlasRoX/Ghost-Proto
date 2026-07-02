import { RepositoryIndex } from '../../src/core/compiler/repository/index';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Repository Snapshot & Index Diffing', () => {
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

  it('should identify added, modified, and deleted symbols between index snapshots', () => {
    // Parent Index (Snapshot A)
    const indexA = new RepositoryIndex();
    const sym1 = ImmutableIRBuilder.createSymbol('Function', 'func1', 'test.ts:func1', span, origin);
    const sym2 = ImmutableIRBuilder.createSymbol('Function', 'func2', 'test.ts:func2', span, origin);
    indexA.addSymbol(sym1);
    indexA.addSymbol(sym2);

    // Current Index (Snapshot B)
    const indexB = new RepositoryIndex();
    
    // sym1 remains unchanged, sym2 is modified, and sym3 is added (sym2 has a different ID because it is modified)
    const sym1New = sym1;
    // Modify metadata on sym2 to change its ID
    const sym2New = ImmutableIRBuilder.createSymbol('Function', 'func2', 'test.ts:func2', span, origin, undefined, { updated: true });
    const sym3 = ImmutableIRBuilder.createSymbol('Function', 'func3', 'test.ts:func3', span, origin);
    
    indexB.addSymbol(sym1New);
    indexB.addSymbol(sym2New);
    indexB.addSymbol(sym3);

    // Calculate diff (B compared against parent A)
    const diff = indexB.diff(indexA);

    expect(diff.added).toEqual(['test.ts:func3']);
    expect(diff.modified).toEqual(['test.ts:func2']);
    expect(diff.deleted).toEqual([]); // sym1 was not deleted
  });
});
