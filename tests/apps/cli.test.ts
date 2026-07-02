import { CLIAdapter } from '../../src/apps/cli';
import { ImmutableIRBuilder } from '../../src/core/compiler/model/builder';
import { IRSpan, IROrigin } from '../../src/core/compiler/schema/metadata';
import * as fs from 'fs';
import * as path from 'path';

describe('CLI Adapter Frontend', () => {
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

  const outputPath = path.join(__dirname, 'cli-report.md');

  afterEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('should parse options and write reports successfully', async () => {
    // Setup symbol with parameter userInput to trigger default rule analyzer
    const sym = ImmutableIRBuilder.createSymbol('Function', 'processQuery', 'test.ts:processQuery', span, origin, undefined, {
      parameters: ['userInput']
    });

    const exitCode = await CLIAdapter.run(
      {
        objectivePreset: 'security',
        outputPath: outputPath
      },
      [[sym]]
    );

    expect(exitCode).toBe(0);
    expect(fs.existsSync(outputPath)).toBe(true);

    const report = fs.readFileSync(outputPath, 'utf-8');
    expect(report).toContain('# Audit Execution Report');
    expect(report).toContain('Total Verified Findings: 1');
  });

  it('should return exit code 1 on loading errors', async () => {
    const exitCode = await CLIAdapter.run(
      {
        objectivePath: 'nonexistent-path.json'
      },
      []
    );
    expect(exitCode).toBe(1);
  });
});
