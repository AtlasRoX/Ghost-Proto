import { SemanticNode } from './parser';
import { IRNode, IRSymbol } from '../../schema/nodes';
import { ImmutableIRBuilder } from '../../model/builder';
import { IROrigin, IRSpan } from '../../schema/metadata';

export class TypeScriptMapper {
  private origin: IROrigin = {
    language: 'typescript',
    parser: 'web-tree-sitter',
    parserVersion: '0.24.3'
  };

  public map(root: SemanticNode, file: string): IRNode[] {
    const nodes: IRNode[] = [];
    
    // Add module symbol representing the file itself
    const fileSpan: IRSpan = {
      file,
      start: root.span.start,
      end: root.span.end
    };
    const fileSymbol = ImmutableIRBuilder.createSymbol(
      'Module',
      file.substring(file.lastIndexOf('/') + 1),
      file,
      fileSpan,
      this.origin
    );
    nodes.push(fileSymbol);

    for (const child of root.children) {
      if (child.type === 'function_declaration') {
        const span: IRSpan = {
          file,
          start: child.span.start,
          end: child.span.end
        };
        const params = (child.metadata.parameters as string[]) || [];
        const fqn = `${file}:${child.name}`;
        
        const sym = ImmutableIRBuilder.createSymbol(
          'Function',
          child.name,
          fqn,
          span,
          this.origin,
          file,
          { parameters: params }
        );
        nodes.push(sym);
      } else if (child.type === 'import_statement') {
        const span: IRSpan = {
          file,
          start: child.span.start,
          end: child.span.end
        };
        const fqn = `${file}:import:${child.name}`;
        
        const sym = ImmutableIRBuilder.createSymbol(
          'Variable',
          child.name,
          fqn,
          span,
          this.origin,
          file,
          { isImport: true, importPath: child.metadata.path }
        );
        nodes.push(sym);
      }
    }

    return nodes;
  }
}
