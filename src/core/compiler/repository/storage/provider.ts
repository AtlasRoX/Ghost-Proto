export interface StorageProvider {
  initialize(dbPath: string): Promise<void>;
  put(prefix: string, key: string, value: Buffer): Promise<void>;
  get(prefix: string, key: string): Promise<Buffer | null>;
  delete(prefix: string, key: string): Promise<void>;
  queryPrefix(prefix: string, keyPrefix: string): AsyncIterable<[string, Buffer]>;
  
  // Transaction and Batch Hooks
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  writeBatch(batch: { type: 'put' | 'del'; prefix: string; key: string; value?: Buffer }[]): Promise<void>;
  
  // Maintenance
  compact(): Promise<void>;
  close(): Promise<void>;
}
