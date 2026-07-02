import { RepositoryIndex } from './index';
import { SymbolService } from './services/symbol';
import { ImportService } from './services/import';
import { ReferenceService } from './services/reference';
import { MetricsService } from './services/metrics';
import { MetadataService } from './services/metadata';
import { QueryIntent } from './query/planner';
export declare class RepositoryContext {
    readonly index: RepositoryIndex;
    symbols: SymbolService;
    imports: ImportService;
    references: ReferenceService;
    metrics: MetricsService;
    metadata: MetadataService;
    private queryPipeline;
    constructor(index: RepositoryIndex);
    query(intent: QueryIntent): Promise<any>;
    diff(other: RepositoryContext): {
        added: string[];
        deleted: string[];
        modified: string[];
    };
}
//# sourceMappingURL=context.d.ts.map