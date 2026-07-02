import { IRSymbol } from './schema/nodes';
export interface SymbolTableEntry {
    symbol: IRSymbol;
    scopeId: string;
    visibility: 'public' | 'private' | 'protected';
    shadowsSymbolId?: string;
}
export declare class SymbolTable {
    private symbols;
    private fqnToSymbolId;
    private scopes;
    define(sym: IRSymbol, scopeId: string, visibility?: 'public' | 'private' | 'protected'): void;
    lookupById(id: string): SymbolTableEntry | undefined;
    lookupByFqn(fqn: string): SymbolTableEntry | undefined;
    getSymbolsInScope(scopeId: string): SymbolTableEntry[];
    getAllEntries(): SymbolTableEntry[];
    clear(): void;
}
//# sourceMappingURL=symbol-table.d.ts.map