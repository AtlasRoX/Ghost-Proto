import { RepositoryIndex } from '../index';

export class MetadataService {
  constructor(private index: RepositoryIndex) {}

  public getFilePaths(): string[] {
    return Array.from(this.index.filePaths);
  }
}
