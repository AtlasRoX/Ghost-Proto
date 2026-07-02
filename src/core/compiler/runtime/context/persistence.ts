export interface PersistenceAdapter {
  transaction(): Promise<void>;
  snapshot(name: string, data: Buffer): Promise<void>;
  restore(name: string): Promise<Buffer | null>;
  merge(name: string, data: Buffer): Promise<void>;
  compact(): Promise<void>;
}

export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private store = new Map<string, Buffer>();

  public async transaction(): Promise<void> {}

  public async snapshot(name: string, data: Buffer): Promise<void> {
    this.store.set(name, data);
  }

  public async restore(name: string): Promise<Buffer | null> {
    return this.store.get(name) || null;
  }

  public async merge(name: string, data: Buffer): Promise<void> {
    this.store.set(name, data);
  }

  public async compact(): Promise<void> {}
}
