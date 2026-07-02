import { RepositoryIndex } from '../index';
import { IRSymbol } from '../../schema/nodes';

export class SymbolService {
  constructor(private index: RepositoryIndex) {}

  public getSymbol(fqn: string): IRSymbol | undefined {
    return this.index.getSymbol(fqn);
  }

  public getSymbolsByFile(filePath: string): IRSymbol[] {
    return Array.from(this.index.symbols.values()).filter(s => s.span?.file === filePath);
  }

  public searchPrefix(prefix: string): IRSymbol[] {
    return Array.from(this.index.symbols.values()).filter(s => s.fqn.startsWith(prefix));
  }
}
