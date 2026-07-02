import { StorageProvider } from './provider';

export class MemoryStorageProvider implements StorageProvider {
  private db = new Map<string, Buffer>(); // "prefix:key" -> value
  private transactionDb: Map<string, Buffer> | null = null;

  public async initialize(_dbPath: string): Promise<void> {}

  private getFullKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  public async put(prefix: string, key: string, value: Buffer): Promise<void> {
    const fullKey = this.getFullKey(prefix, key);
    if (this.transactionDb) {
      this.transactionDb.set(fullKey, value);
    } else {
      this.db.set(fullKey, value);
    }
  }

  public async get(prefix: string, key: string): Promise<Buffer | null> {
    const fullKey = this.getFullKey(prefix, key);
    const map = this.transactionDb || this.db;
    return map.get(fullKey) || null;
  }

  public async delete(prefix: string, key: string): Promise<void> {
    const fullKey = this.getFullKey(prefix, key);
    if (this.transactionDb) {
      this.transactionDb.delete(fullKey);
    } else {
      this.db.delete(fullKey);
    }
  }

  public async *queryPrefix(prefix: string, keyPrefix: string): AsyncIterable<[string, Buffer]> {
    const map = this.transactionDb || this.db;
    const prefixString = `${prefix}:${keyPrefix}`;

    for (const [fullKey, value] of map.entries()) {
      if (fullKey.startsWith(prefixString)) {
        const key = fullKey.substring(prefix.length + 1);
        yield [key, value];
      }
    }
  }

  public async beginTransaction(): Promise<void> {
    this.transactionDb = new Map(this.db);
  }

  public async commitTransaction(): Promise<void> {
    if (this.transactionDb) {
      this.db = this.transactionDb;
      this.transactionDb = null;
    }
  }

  public async rollbackTransaction(): Promise<void> {
    this.transactionDb = null;
  }

  public async writeBatch(batch: { type: 'put' | 'del'; prefix: string; key: string; value?: Buffer }[]): Promise<void> {
    for (const op of batch) {
      if (op.type === 'put' && op.value) {
        await this.put(op.prefix, op.key, op.value);
      } else if (op.type === 'del') {
        await this.delete(op.prefix, op.key);
      }
    }
  }

  public async compact(): Promise<void> {}

  public async close(): Promise<void> {
    this.db.clear();
    this.transactionDb = null;
  }
}
