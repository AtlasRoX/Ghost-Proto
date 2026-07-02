# GhostProto Studio Architecture Decision Record (ADR)

This document establishes the architectural invariants and design patterns for **GhostProto Studio**, the flagship desktop platform built on top of the GhostProto engine.

---

## Architectural Invariants

1.  **Platform Decoupling:** The user interface code (React/Tauri) must never contain compiler, analyzer, or executor logic. All operations must route through the `Application SDK` via the Tauri IPC layer.
2.  **Workbench Core:** The application is organized around a unified `Workbench` container that manages window cycles, layout docking, selection states, and shared service registries.
3.  **Extension Model:** All developer-facing workspaces (Explorer, AI, Graphs, Reports) are decoupled features called `extensions`. Extensions contribute views, inspectors, commands, and timeline nodes to the workbench registries.
4.  **Single Selection Model:** Views communicate with each other through a shared `SelectionService` (e.g. clicking a finding automatically centers code editor windows, CFG panels, and the inspector panel).
5.  **State Isolation:** Features must interact with the workbench through stateless services rather than invoking global state-stores directly.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    STUDIO WORKBENCH                     │
│  (Window, Docking, State, Layout, Palette Managers)      │
├─────────────────────────────────────────────────────────┤
│                     STUDIO SERVICES                     │
│  (Selection, Workspace, Command, Timeline, Nav Services)│
├─────────────────────────────────────────────────────────┤
│                   FEATURE EXTENSIONS                    │
│  (Repository, Investigation, Graph, AI, Reports, Config)│
├─────────────────────────────────────────────────────────┤
│                      ENGINE SDK                         │
│  (Tauri IPC, Events, Compiler, Analysis, Runtime)       │
└─────────────────────────────────────────────────────────┘
```

---

## Shared Services Registry

*   **WorkspaceService:** Opens, saves, and monitors projects (branch, branch diff snapshots).
*   **SelectionService:** Dispatches repository focus states (active file, selected symbol, current finding ID).
*   **CommandService:** Command palette dispatcher mapping keystrokes (`Ctrl+Shift+P` / `:`) to action events.
*   **TimelineService:** Tracks compilation and execution events, enabling users to scrub through runs step-by-step.
*   **InspectorService:** Directs context panels mapping fields, evidence metrics, and AI recommendations to active selections.

---

## Investigation Mode Lifecycle

`Investigation Mode` is a global visual mode that isolates a target finding:

```
[Finding Selected]
        │
        ▼
[Switch Layout Mode to "Investigation"]
        │
        ├─► Left Panel:   Evidence Lists (CFG variables, SSA steps)
        ├─► Center Panel: Code Viewer (Monaco) + Graph Canvas (React Flow CFG)
        ├─► Right Panel:  AI Code-Fix Suggestions + Inspector Properties
        └─► Bottom Panel: Consensus Votes & Runtime Diagnostics
        │
        ▼
[Investigation Closed]
        │
        ▼
[Restore Layout Mode to "Normal Workspace"]
```
