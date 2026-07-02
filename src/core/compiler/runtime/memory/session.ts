export class SessionMemory {
  private config = new Map<string, any>();
  private featureFlags = new Set<string>();

  public set(key: string, value: any): void {
    this.config.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.config.get(key);
  }

  public enableFeature(flag: string): void {
    this.featureFlags.add(flag);
  }

  public isFeatureEnabled(flag: string): boolean {
    return this.featureFlags.has(flag);
  }

  public clear(): void {
    this.config.clear();
    this.featureFlags.clear();
  }
}
