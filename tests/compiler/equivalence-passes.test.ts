import { CompilerAPI } from '../../src/core/compiler/api';
import { TypeScriptLanguageAdapter } from '../../src/core/compiler/languages/typescript/adapter';
import { ScopePass } from '../../src/core/compiler/passes/scope-pass';
import { ImportPass } from '../../src/core/compiler/passes/import-pass';
import { ReferencePass } from '../../src/core/compiler/passes/ref-pass';

describe('Equivalence and Transformation Passes', () => {
  let api: CompilerAPI;

  beforeEach(() => {
    api = new CompilerAPI();
    api.registerLanguage(new TypeScriptLanguageAdapter());
    api.registerPass(new ScopePass());
    api.registerPass(new ImportPass());
    api.registerPass(new ReferencePass());
  });

  it('should compile equivalent program outputs to identical serialized hashes', async () => {
    const src1 = `
      function add(a, b) {
        return a + b;
      }
    `;
    const src2 = `
      // This is a comment
      function add(a,b){
        return a+b;
      }
    `;

    const res1 = await api.compileFile('test.ts', src1, '/root', 'typescript');
    const res2 = await api.compileFile('test.ts', src2, '/root', 'typescript');

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    
    // Parse and strip spans to verify semantic equivalence
    const nodes1 = JSON.parse(res1.serialized).map((n: any) => { delete n.span; return n; });
    const nodes2 = JSON.parse(res2.serialized).map((n: any) => { delete n.span; return n; });

    expect(nodes1).toEqual(nodes2);
  });
});
