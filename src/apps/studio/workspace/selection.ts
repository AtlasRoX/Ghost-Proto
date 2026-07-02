export interface StudioSelection {
  activeFile: string | null;
  selectedSymbolFqn: string | null;
  currentFindingId: string | null;
}

export type SelectionListener = (selection: StudioSelection) => void;

export class SelectionService {
  private currentSelection: StudioSelection = {
    activeFile: null,
    selectedSymbolFqn: null,
    currentFindingId: null
  };

  private listeners = new Set<SelectionListener>();

  public getSelection(): StudioSelection {
    return { ...this.currentSelection };
  }

  public selectFile(filePath: string): void {
    this.currentSelection.activeFile = filePath;
    this.notify();
  }

  public selectSymbol(fqn: string): void {
    this.currentSelection.selectedSymbolFqn = fqn;
    this.notify();
  }

  public selectFinding(id: string): void {
    this.currentSelection.currentFindingId = id;
    this.notify();
  }

  public subscribe(listener: SelectionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getSelection();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public clear(): void {
    this.currentSelection = {
      activeFile: null,
      selectedSymbolFqn: null,
      currentFindingId: null
    };
    this.notify();
  }
}
