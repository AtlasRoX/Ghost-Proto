import { TypeScriptLanguageAdapter } from '../../src/core/compiler/languages/typescript/adapter';
import { CompilerContext } from '../../src/core/compiler/context';
import { IRSymbol } from '../../src/core/compiler/schema/nodes';

describe('Parser Recovery under Incomplete Code', () => {
  it('should parse partial code snippets without failing compilation', async () => {
    const adapter = new TypeScriptLanguageAdapter();
    const ctx = new CompilerContext('typescript', '/root');
    const source = `
      import { db }
      function brokenCode(
    `;

    // Should not throw, should return whatever symbols were successfully identified
    const ir = await adapter.compile(ctx, source, 'broken.ts');
    expect(ir.length).toBeGreaterThanOrEqual(1);

    const symbols = ir.filter(n => n.kind === 'Symbol') as IRSymbol[];
    expect(symbols.find(s => s.symbolKind === 'Module')).toBeDefined();
  });
});
