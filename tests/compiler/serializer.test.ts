import { JSONSerializer } from '../../src/core/compiler/model/serializer';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRNode } from '../../src/core/compiler/schema/nodes';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('JSONSerializer (Canonical Ordering & Determinism)', () => {
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

  it('should serialize nodes deterministically regardless of input ordering', () => {
    const serializer = new JSONSerializer();
    const symA = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin);
    const symB = ImmutableIRBuilder.createSymbol('Function', 'funcB', 'test.ts:funcB', span, origin);

    // Serialize order A then B
    const ser1 = serializer.serialize([symA, symB]);
    // Serialize order B then A
    const ser2 = serializer.serialize([symB, symA]);

    expect(ser1).toBe(ser2);
  });

  it('should sort object keys recursively in serialization output', () => {
    const serializer = new JSONSerializer();
    const sym = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin, undefined, {
      beta: 2,
      alpha: 1
    });

    const output = serializer.serialize([sym]);
    
    // Ensure keys in metadata are canonically sorted (alpha before beta)
    const indexAlpha = output.indexOf('alpha');
    const indexBeta = output.indexOf('beta');
    expect(indexAlpha).toBeLessThan(indexBeta);
  });
});
