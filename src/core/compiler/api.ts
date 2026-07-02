import { CompilerContext, Diagnostic } from './context';
import { LanguageRegistry, LanguageAdapter } from './registry';
import { PassManager, CompilerPass } from './manager';
import { IRNode } from './schema/nodes';
import { GhostIRValidator } from './model/validator';
import { JSONSerializer, IRSerializer } from './model/serializer';

export interface CompilationResult {
  success: boolean;
  ir: IRNode[];
  diagnostics: Diagnostic[];
  serialized: string;
}

export class CompilerAPI {
  private registry = new LanguageRegistry();
  private passManager = new PassManager();
  private serializer: IRSerializer = new JSONSerializer();

  constructor() {}

  public registerLanguage(adapter: LanguageAdapter): void {
    this.registry.registerAdapter(adapter);
  }

  public registerPass(pass: CompilerPass): void {
    this.passManager.registerPass(pass);
  }

  public setSerializer(serializer: IRSerializer): void {
    this.serializer = serializer;
  }

  public async compileFile(
    filePath: string,
    source: string,
    projectRoot: string,
    languageId: string
  ): Promise<CompilationResult> {
    const ctx = new CompilerContext(languageId, projectRoot);
    const adapter = this.registry.getAdapterForExtension(filePath.substring(filePath.lastIndexOf('.')));

    if (!adapter) {
      ctx.emit({
        severity: 'error',
        code: 'ERR_LANG_NOT_REGISTERED',
        message: `No language adapter registered for file extension: ${filePath}`
      });
      return {
        success: false,
        ir: [],
        diagnostics: ctx.diagnostics,
        serialized: ''
      };
    }

    try {
      const initialIr = await adapter.compile(ctx, source, filePath);
      const optimizedIr = await this.passManager.executePipeline(ctx, initialIr);

      // Verify the final compiled product through L1-L4 validator checks
      const valid = GhostIRValidator.validate(ctx, optimizedIr, 4);

      if (!valid || ctx.hasErrors()) {
        return {
          success: false,
          ir: [],
          diagnostics: ctx.diagnostics,
          serialized: ''
        };
      }

      const serialized = this.serializer.serialize(optimizedIr);

      return {
        success: true,
        ir: optimizedIr,
        diagnostics: ctx.diagnostics,
        serialized
      };
    } catch (e: any) {
      ctx.emit({
        severity: 'error',
        code: 'ERR_UNCAUGHT_COMPILER_EXCEPTION',
        message: `Uncaught exception during compilation: ${e.message || e}`
      });
      return {
        success: false,
        ir: [],
        diagnostics: ctx.diagnostics,
        serialized: ''
      };
    }
  }
}
