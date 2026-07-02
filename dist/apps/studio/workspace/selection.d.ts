export interface StudioSelection {
    activeFile: string | null;
    selectedSymbolFqn: string | null;
    currentFindingId: string | null;
}
export type SelectionListener = (selection: StudioSelection) => void;
export declare class SelectionService {
    private currentSelection;
    private listeners;
    getSelection(): StudioSelection;
    selectFile(filePath: string): void;
    selectSymbol(fqn: string): void;
    selectFinding(id: string): void;
    subscribe(listener: SelectionListener): () => void;
    private notify;
    clear(): void;
}
//# sourceMappingURL=selection.d.ts.map