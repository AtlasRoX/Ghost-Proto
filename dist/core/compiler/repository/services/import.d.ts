import { RepositoryIndex } from '../index';
import { IRSymbol } from '../../schema/nodes';
export declare class ImportService {
    private index;
    constructor(index: RepositoryIndex);
    getImports(filePath: string): IRSymbol[];
}
//# sourceMappingURL=import.d.ts.map