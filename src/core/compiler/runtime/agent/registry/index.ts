export class RoleRegistry {
  private roles = new Map<string, any>();

  public register(name: string, role: any): void {
    this.roles.set(name, role);
  }

  public get<T>(name: string): T | undefined {
    return this.roles.get(name);
  }
}

export class StrategyRegistry {
  private strategies = new Map<string, any>();

  public register(name: string, strategy: any): void {
    this.strategies.set(name, strategy);
  }

  public get<T>(name: string): T | undefined {
    return this.strategies.get(name);
  }
}
