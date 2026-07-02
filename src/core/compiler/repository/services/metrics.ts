import { RepositoryIndex, RepositoryMetrics } from '../index';

export class MetricsService {
  constructor(private index: RepositoryIndex) {}

  public getMetrics(): RepositoryMetrics {
    return this.index.getMetrics();
  }
}
