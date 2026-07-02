import { StorageProvider } from './provider';
import { MemoryStorageProvider } from './memory';

export class SQLiteStorageProvider implements StorageProvider {
  private fallback = new MemoryStorageProvider();
  private dbPath = ':memory:';

  public async initialize(dbPath: string): Promise<void> {
    this.dbPath = dbPath;
    await this.fallback.initialize(dbPath);
  }

  public async put(prefix: string, key: string, value: Buffer): Promise<void> {
    await this.fallback.put(prefix, key, value);
  }

  public async get(prefix: string, key: string): Promise<Buffer | null> {
    return this.fallback.get(prefix, key);
  }

  public async delete(prefix: string, key: string): Promise<void> {
    await this.fallback.delete(prefix, key);
  }

  public async *queryPrefix(prefix: string, keyPrefix: string): AsyncIterable<[string, Buffer]> {
    yield* this.fallback.queryPrefix(prefix, keyPrefix);
  }

  public async beginTransaction(): Promise<void> {
    await this.fallback.beginTransaction();
  }

  public async commitTransaction(): Promise<void> {
    await this.fallback.commitTransaction();
  }

  public async rollbackTransaction(): Promise<void> {
    await this.fallback.rollbackTransaction();
  }

  public async writeBatch(batch: { type: 'put' | 'del'; prefix: string; key: string; value?: Buffer }[]): Promise<void> {
    await this.fallback.writeBatch(batch);
  }

  public async compact(): Promise<void> {
    await this.fallback.compact();
  }

  public async close(): Promise<void> {
    await this.fallback.close();
  }
}
