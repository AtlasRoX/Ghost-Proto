import { RepositoryIndex } from '../index';
import { IRSymbol } from '../../schema/nodes';

export class ImportService {
  constructor(private index: RepositoryIndex) {}

  public getImports(filePath: string): IRSymbol[] {
    return Array.from(this.index.symbols.values()).filter(
      s => s.span?.file === filePath && s.symbolKind === 'Variable' && s.metadata.isImport
    );
  }
}
