import { IRSymbol } from './schema/nodes';

export interface SymbolTableEntry {
  symbol: IRSymbol;
  scopeId: string;
  visibility: 'public' | 'private' | 'protected';
  shadowsSymbolId?: string;
}

export class SymbolTable {
  private symbols = new Map<string, SymbolTableEntry>(); // symbol ID -> Entry
  private fqnToSymbolId = new Map<string, string>(); // FQN -> symbol ID
  private scopes = new Map<string, string[]>(); // scopeId -> symbol IDs

  public define(
    sym: IRSymbol,
    scopeId: string,
    visibility: 'public' | 'private' | 'protected' = 'public'
  ): void {
    const existingId = this.fqnToSymbolId.get(sym.fqn);
    const entry: SymbolTableEntry = {
      symbol: sym,
      scopeId,
      visibility,
      shadowsSymbolId: existingId
    };

    this.symbols.set(sym.id, entry);
    this.fqnToSymbolId.set(sym.fqn, sym.id);

    if (!this.scopes.has(scopeId)) {
      this.scopes.set(scopeId, []);
    }
    this.scopes.get(scopeId)!.push(sym.id);
  }

  public lookupById(id: string): SymbolTableEntry | undefined {
    return this.symbols.get(id);
  }

  public lookupByFqn(fqn: string): SymbolTableEntry | undefined {
    const id = this.fqnToSymbolId.get(fqn);
    return id ? this.symbols.get(id) : undefined;
  }

  public getSymbolsInScope(scopeId: string): SymbolTableEntry[] {
    const ids = this.scopes.get(scopeId) || [];
    return ids.map(id => this.symbols.get(id)!).filter(Boolean);
  }

  public getAllEntries(): SymbolTableEntry[] {
    return Array.from(this.symbols.values());
  }

  public clear(): void {
    this.symbols.clear();
    this.fqnToSymbolId.clear();
    this.scopes.clear();
  }
}
