import { RepositoryIndex } from '../index';
import { IRSymbol } from '../../schema/nodes';
export declare class SymbolService {
    private index;
    constructor(index: RepositoryIndex);
    getSymbol(fqn: string): IRSymbol | undefined;
    getSymbolsByFile(filePath: string): IRSymbol[];
    searchPrefix(prefix: string): IRSymbol[];
}
//# sourceMappingURL=symbol.d.ts.map