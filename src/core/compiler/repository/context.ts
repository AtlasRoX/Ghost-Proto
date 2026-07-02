import { RepositoryIndex } from './index';
import { SymbolService } from './services/symbol';
import { ImportService } from './services/import';
import { ReferenceService } from './services/reference';
import { MetricsService } from './services/metrics';
import { MetadataService } from './services/metadata';
import { QueryPipeline } from './query/pipeline';
import { QueryExecutor } from './query/executor';
import { QueryIntent } from './query/planner';

export class RepositoryContext {
  public symbols: SymbolService;
  public imports: ImportService;
  public references: ReferenceService;
  public metrics: MetricsService;
  public metadata: MetadataService;
  
  private queryPipeline: QueryPipeline;

  constructor(public readonly index: RepositoryIndex) {
    this.symbols = new SymbolService(index);
    this.imports = new ImportService(index);
    this.references = new ReferenceService(index);
    this.metrics = new MetricsService(index);
    this.metadata = new MetadataService(index);

    const executor = new QueryExecutor(this.symbols, this.references, this.metrics);
    this.queryPipeline = new QueryPipeline(executor);
  }

  public async query(intent: QueryIntent): Promise<any> {
    return this.queryPipeline.query(intent);
  }

  public diff(other: RepositoryContext): { added: string[]; deleted: string[]; modified: string[] } {
    return this.index.diff(other.index);
  }
}
