import { LanguageAdapter } from '../../registry';
import { CompilerContext } from '../../context';
import { IRNode } from '../../schema/nodes';
import { TypeScriptParser } from './parser';
import { TypeScriptMapper } from './mapper';
import { TypeScriptResolver } from './resolver';

export class TypeScriptLanguageAdapter implements LanguageAdapter {
  public languageId = 'typescript';
  public extensions = ['.ts', '.tsx', '.js', '.jsx'];
  public capabilities = ['decorators', 'jsx', 'types', 'imports'];

  private parser = new TypeScriptParser();
  private mapper = new TypeScriptMapper();
  private resolver = new TypeScriptResolver();
  private initialized = false;

  public async compile(ctx: CompilerContext, source: string, filePath: string): Promise<IRNode[]> {
    if (!this.initialized) {
      await this.parser.initialize();
      this.initialized = true;
    }

    const semanticNode = this.parser.parse(ctx, source, filePath);
    const irNodes = this.mapper.map(semanticNode, filePath);
    this.resolver.resolveImports(ctx, irNodes, filePath);

    return irNodes;
  }
}
