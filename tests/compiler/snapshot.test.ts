import { CompilerAPI } from '../../src/core/compiler/api';
import { TypeScriptLanguageAdapter } from '../../src/core/compiler/languages/typescript/adapter';

describe('IR Snapshot Regression', () => {
  it('should compile to matching snapshot shapes', async () => {
    const api = new CompilerAPI();
    api.registerLanguage(new TypeScriptLanguageAdapter());

    const source = `
      function fetchRecord(id) {
        return id;
      }
    `;

    const res = await api.compileFile('test.ts', source, '/root', 'typescript');
    expect(res.success).toBe(true);

    const parsed = JSON.parse(res.serialized);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('kind');
    expect(parsed[0]).toHaveProperty('span');
    expect(parsed[0]).toHaveProperty('origin');
  });
});
