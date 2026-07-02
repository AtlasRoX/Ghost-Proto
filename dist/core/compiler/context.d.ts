import { IRSpan } from './schema/metadata';
export interface Diagnostic {
    severity: 'info' | 'warning' | 'error';
    code: string;
    message: string;
    location?: IRSpan;
    hint?: string;
    fix?: string;
}
export declare class CompilerContext {
    readonly language: string;
    readonly projectRoot: string;
    readonly compilerVersion: string;
    diagnostics: Diagnostic[];
    cache: Map<string, unknown>;
    flags: Record<string, boolean>;
    constructor(language: string, projectRoot: string, compilerVersion?: string);
    emit(diagnostic: Diagnostic): void;
    hasErrors(): boolean;
    clearDiagnostics(): void;
}
//# sourceMappingURL=context.d.ts.map