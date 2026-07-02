import { MarkdownRenderer } from '../../src/core/compiler/analysis/render/markdown';
import { PromptRenderer } from '../../src/core/compiler/analysis/render/prompt';
import { ContextPackage } from '../../src/core/compiler/analysis/context-builder/schema';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Context Presentation Renderers', () => {
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

  it('should render context packages into formatted markdown and prompts', () => {
    const sym = ImmutableIRBuilder.createSymbol('Function', 'funcA', 'test.ts:funcA', span, origin);
    
    const pkg: ContextPackage = {
      policyName: 'HIPAA Security Policy',
      symbols: [sym],
      findings: [],
      paths: [],
      metrics: {
        symbolCount: 1,
        findingsCount: 0,
        pathsCount: 0
      }
    };

    const markdown = MarkdownRenderer.render(pkg);
    expect(markdown).toContain('# Context Package: HIPAA Security Policy');
    expect(markdown).toContain('test.ts:funcA');

    const prompt = PromptRenderer.renderPrompt(pkg, 50);
    expect(prompt).toContain('[SYSTEM CONTEXT]');
    expect(prompt).toContain('[/SYSTEM CONTEXT]');
  });
});
