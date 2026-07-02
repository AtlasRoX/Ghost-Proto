import { IRSpan } from './schema/metadata';

export interface Diagnostic {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  location?: IRSpan;
  hint?: string;
  fix?: string;
}

export class CompilerContext {
  public diagnostics: Diagnostic[] = [];
  public cache: Map<string, unknown> = new Map();
  public flags: Record<string, boolean> = {};

  constructor(
    public readonly language: string,
    public readonly projectRoot: string,
    public readonly compilerVersion: string = '2.0.0'
  ) {}

  public emit(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  public hasErrors(): boolean {
    return this.diagnostics.some(d => d.severity === 'error');
  }

  public clearDiagnostics(): void {
    this.diagnostics = [];
  }
}
