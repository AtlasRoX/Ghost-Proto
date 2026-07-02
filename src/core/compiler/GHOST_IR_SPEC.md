# Ghost Intermediate Representation (Ghost IR) Specification
**Version:** 1.0.0  
**Status:** Canonical Draft  

---

## 1. Introduction & Philosophy
Ghost Intermediate Representation (Ghost IR) is a language-neutral, immutable, syntax-independent representation of program structures, relationships, and execution semantics. 

Ghost IR decouples source code parsing from static analysis rules, dependency tracers, call graph builders, and AI reasoning loops. Rather than having downstream components parse language-specific ASTs (e.g., TypeScript, Python, Go), all source code is compiled into Ghost IR.

---

## 2. Global Invariants
1. **Immutability:** Once an IR block is created, it cannot be mutated. Transformations, optimizations, and metadata bindings emit new, copy-on-write IR instances.
2. **Deterministic Canonical Ordering:** All child structures, references, and metadata maps are stored in lexicographically sorted arrays to ensure identical program sources yield identical hashes.
3. **Traceability (Source Maps):** Every node in Ghost IR must map back to its physical origin file, byte offset, line, and column.
4. **Namespace Uniqueness:** Symbols are identified by fully qualified names (FQNs) based on file path and module nesting.

---

## 3. Node Specifications
Every element in the Ghost IR is a **Node** conforming to the base schema:

```typescript
export interface IRNode {
  id: string;          // Stable SHA-256 fingerprint hash of content
  kind: string;        // Symbol, Operation, Scope, etc.
  version: number;     // Schema versioning
  span: IRSpan;        // Precise source location
  origin: IROrigin;    // Metadata about translation (language, parser version)
  metadata: Record<string, unknown>; // Extensible key-value annotations
}
```

### 3.1 Entity Types (`kind: "Symbol"`)
Symbols represent declarations in a program:
* **Module:** Namespace boundaries (e.g., packages, files).
* **Type:** Interface, struct, union, type alias, or class declarations.
* **Function:** Global functions, standalone procedures.
* **Method:** Class or struct member functions.
* **Variable:** Constant or mutable variable declarations.

### 3.2 Operations (`kind: "Operation"`)
Operations represent code instructions inside control flow blocks:
* **ASSIGN:** Variable bindings ($x = y$).
* **CALL:** Invocations of functions or methods.
* **BRANCH:** Conditional execution paths.
* **LOOP:** Cyclic control loops.
* **RETURN:** Exiting execution scopes.
* **CONSTANT:** Literal values.

### 3.3 Scopes (`kind: "Scope"`)
Scopes represent logical visibility boundaries (lexical scopes, module scopes, class scopes, function scopes).

---

## 4. Serialization Format
Ghost IR supports two serialization formats:
1. **JSON:** Standard, human-readable format used for transport and debugging. Keys must be sorted alphabetically.
2. **MessagePack:** Binary serialized format used for high-performance disk storage and incremental caches.

---

## 5. Versioning and Extensibility
Ghost IR uses semantic versioning (`major.minor.patch`). Breaking changes to the IR schema (e.g., removing a node property) increment the major version. Custom metadata tags are grouped under the `metadata` dictionary to ensure backward compatibility.
