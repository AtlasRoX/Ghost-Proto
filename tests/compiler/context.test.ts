import { CompilerContext } from '../../src/core/compiler/context';

describe('CompilerContext & Diagnostics Engine', () => {
  it('should initialize with empty diagnostics and no errors', () => {
    const ctx = new CompilerContext('typescript', '/root');
    expect(ctx.diagnostics).toHaveLength(0);
    expect(ctx.hasErrors()).toBe(false);
  });

  it('should log warning diagnostics and not fail validation', () => {
    const ctx = new CompilerContext('typescript', '/root');
    ctx.emit({
      severity: 'warning',
      code: 'WARN_TEST',
      message: 'Test warning'
    });
    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.hasErrors()).toBe(false);
  });

  it('should log error diagnostics and fail validation', () => {
    const ctx = new CompilerContext('typescript', '/root');
    ctx.emit({
      severity: 'error',
      code: 'ERR_TEST',
      message: 'Test error'
    });
    expect(ctx.diagnostics).toHaveLength(1);
    expect(ctx.hasErrors()).toBe(true);
  });
});
