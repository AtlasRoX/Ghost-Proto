import { TypeScriptLanguageAdapter } from '../../src/core/compiler/languages/typescript/adapter';
import { CompilerAPI } from '../../src/core/compiler/api';
import { CompilerContext } from '../../src/core/compiler/context';
import { IRSymbol } from '../../src/core/compiler/schema/nodes';

describe('TypeScript Language Adapter', () => {
  it('should compile basic TypeScript declarations successfully', async () => {
    const adapter = new TypeScriptLanguageAdapter();
    const ctx = new CompilerContext('typescript', '/root');
    const source = `
      import { db } from './db';
      function calculateTotal(items) {
        return items.length;
      }
    `;

    const ir = await adapter.compile(ctx, source, 'test.ts');
    
    // Assert Module symbol and Function symbol exist
    const symbols = ir.filter(n => n.kind === 'Symbol') as IRSymbol[];
    expect(symbols).toHaveLength(3); // Module test.ts, Import db, Function calculateTotal

    const fileSymbol = symbols.find(s => s.symbolKind === 'Module');
    expect(fileSymbol?.name).toBe('test.ts');

    const funcSymbol = symbols.find(s => s.symbolKind === 'Function');
    expect(funcSymbol?.name).toBe('calculateTotal');
  });
});
