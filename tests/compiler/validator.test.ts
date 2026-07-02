import { GhostIRValidator } from '../../src/core/compiler/model/validator';
import { CompilerContext } from '../../src/core/compiler/context';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRNode } from '../../src/core/compiler/schema/nodes';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('GhostIRValidator (Verification Tiers L1-L4)', () => {
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

  it('should pass validation for clean outputs', () => {
    const ctx = new CompilerContext('typescript', '/root');
    const symbolA = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin);
    const ir: IRNode[] = [symbolA];

    const valid = GhostIRValidator.validate(ctx, ir, 4);
    expect(valid).toBe(true);
    expect(ctx.hasErrors()).toBe(false);
  });

  it('should fail reference validation if edge targets are missing', () => {
    const ctx = new CompilerContext('typescript', '/root');
    const symbolA = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin);
    
    // Create edge pointing to a nonexistent node ID
    const edge = ImmutableIRBuilder.createEdge('CALLS', symbolA.id, 'missing_id', span, origin);
    const ir: IRNode[] = [symbolA, edge];

    const valid = GhostIRValidator.validate(ctx, ir, 4);
    expect(valid).toBe(false);
    expect(ctx.hasErrors()).toBe(true);
  });

  it('should detect and report circular scope structures', () => {
    const ctx = new CompilerContext('typescript', '/root');
    const symA = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin, 'test.ts:funcB');
    const symB = ImmutableIRBuilder.createSymbol('Function', 'funcB', 'test.ts:funcB', span, origin, 'test.ts:funcA');
    const ir: IRNode[] = [symA, symB];

    const valid = GhostIRValidator.validate(ctx, ir, 4);
    expect(valid).toBe(false);
    expect(ctx.hasErrors()).toBe(true);
  });
});
