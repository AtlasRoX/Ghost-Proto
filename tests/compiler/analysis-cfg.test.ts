import { CFGBuilder } from '../../src/core/compiler/analysis/graph/cfg';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Control Flow Graph Generation', () => {
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

  it('should compile statements into structured CFG block branches', () => {
    const func = ImmutableIRBuilder.createSymbol('Function', 'processInput', 'test.ts:processInput', span, origin, undefined, {
      parameters: ['queryParam']
    });

    const cfg = CFGBuilder.build(func);
    expect(cfg.entryBlockId).toBe('test.ts:processInput:block_0');

    const block = cfg.blocks.get(cfg.entryBlockId);
    expect(block).toBeDefined();
    expect(block?.statements).toContain('param queryParam');
  });
});
