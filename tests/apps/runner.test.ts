import { ApplicationRunner } from '../../src/apps/shared/runner';
import { ObjectiveLoader } from '../../src/apps/shared/objective-loader';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';

describe('Application Runner SDK', () => {
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

  it('should run audits using loaded objective profiles and produce reports', async () => {
    // Setup symbol with parameter userInput to trigger default rule analyzer
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const objective = ObjectiveLoader.loadPreset('security');
    const report = await ApplicationRunner.runAudit(objective, [[sym]]);

    expect(report).toContain('# Audit Execution Report');
    expect(report).toContain('Total Verified Findings: 1');
  });
});
