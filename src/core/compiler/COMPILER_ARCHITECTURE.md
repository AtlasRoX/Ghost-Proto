# Ghost Compiler Architecture Spec
**Version:** 1.0.0  
**Status:** Approved Specification  

---

## 1. Compiler Philosophy
The Ghost compiler pipeline is designed to be fully deterministic, type-safe, non-throwing, and highly extensible. It translates AST inputs into optimized, verified, and canonical Ghost IR.

---

## 2. Compilation Lifecycle
The compiler processes code using a strict, multi-step pipeline:

```
[ Scanner Discoveries ]
         │
         ▼
┌─────────────────┐
│  Compiler API   │
└─────────────────┘
         │
         ▼
┌──────────────────┐
│ CompilerContext  │◄─── [ Diagnostic Registry ]
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Language Registry│◄─── [ Capability negotiation ]
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   Pass Manager   │
└──────────────────┘
         │
         ├─► [ AST Passes (Imports, Scopes) ]
         │
         ├─► [ AST to IR Translation ]
         │
         └─► [ IR Passes (DCE, Constant Folding, Normalization) ]
         │
         ▼
┌──────────────────┐
│ GhostIRValidator │───► [ Verifies Schema & Semantics L1-L4 ]
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   Serializer     │───► [ Canonical Serialization & Hashing ]
└──────────────────┘
```

---

## 3. Context & Diagnostics Model
To prevent execution interrupts, the compiler avoids throwing raw exceptions. Instead, it runs on a unified `CompilerContext` containing a diagnostic reporter.

```typescript
export interface Diagnostic {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  location?: IRSpan;
  hint?: string;
  fix?: string;
}
```

* **Error Isolation:** Errors encountered during parsing, symbol resolution, or validation are recorded as `error` diagnostics. If any `error` diagnostic is present in the context, compilation fails gracefully, return-routing all diagnostics back to the caller.

---

## 4. Pass Manager & DAG Scheduling
Compilation steps are organized as compiler **Passes**. Instead of executing linearly, the **Pass Manager** schedules execution as a Directed Acyclic Graph (DAG) based on declared metadata dependencies:

```typescript
export interface CompilerPass {
  name: string;
  dependencies: string[]; // Names of passes that must run before this
  invalidates: string[];  // Metadata keys this pass invalidates
  parallelizable: boolean;
  execute(ctx: CompilerContext, ir: ImmutableIR): Promise<ImmutableIR>;
}
```

---

## 5. Verification Tiers
Validation is performed in 4 progressive levels inside the `GhostIRValidator`:
* **Level 1 (Schema Integrity):** Verifies syntax correctness, node types, and required field existence.
* **Level 2 (Reference Integrity):** Verifies that all symbols references map to valid declared FQNs.
* **Level 3 (Semantic Integrity):** Verifies type compatibility and variable assignments.
* **Level 4 (Optimization Safety):** Verifies that optimization passes did not alter variable dependencies or break control flow paths.
