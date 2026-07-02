"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionService = void 0;
class SelectionService {
    constructor() {
        this.currentSelection = {
            activeFile: null,
            selectedSymbolFqn: null,
            currentFindingId: null
        };
        this.listeners = new Set();
    }
    getSelection() {
        return { ...this.currentSelection };
    }
    selectFile(filePath) {
        this.currentSelection.activeFile = filePath;
        this.notify();
    }
    selectSymbol(fqn) {
        this.currentSelection.selectedSymbolFqn = fqn;
        this.notify();
    }
    selectFinding(id) {
        this.currentSelection.currentFindingId = id;
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        const state = this.getSelection();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
    clear() {
        this.currentSelection = {
            activeFile: null,
            selectedSymbolFqn: null,
            currentFindingId: null
        };
        this.notify();
    }
}
exports.SelectionService = SelectionService;
//# sourceMappingURL=selection.js.map