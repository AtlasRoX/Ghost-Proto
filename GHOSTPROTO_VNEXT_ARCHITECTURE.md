# GhostProto vNext: Architectural Redesign & Platform Specification
**Document Version:** 2.0.0-PROD  
**Classification:** Internal Engineering Specification  
**Authors:** Principal Software Architect, Staff Security Engineer, AI Systems Researcher, Static Analysis Expert, Developer Tooling Architect  

---

## Executive Summary

This document specifies the architecture for **GhostProto vNext**, evolving it from a CLI-bound, regex-reliant codebase scanner (v0.2.2) into a production-grade, graph-powered, multi-agent software intelligence platform. GhostProto vNext bridges the gap between deterministic compiler theory (ASTs, CFGs, SSA, Taint Analysis) and probabilistic AI reasoning by introducing **Ghost Intermediate Representation (Ghost IR)**, decoupling detection from reasoning, and implementing a central **Query Engine** abstraction. This architecture is designed to scale horizontally across multi-million line codebases while maintaining a zero-hallucination evidence standard.

---

## Chapter 1: Executive Architecture Review & v0.2.2 Autopsy

### 1.1 Core Architectural Tenets
GhostProto vNext is built on five non-negotiable architectural invariants:
1. **Deterministic Foundations, Probabilistic Synthesis:** AI agents must not search raw text. They reason over structured indices, semantic graphs, and compiler-generated intermediate representations (IR) queried via a deterministic Query Engine.
2. **Strict Verification Gatekeeping:** No finding is emitted without concrete proof. Every candidate vulnerability must trace back to verified execution path sequences, exact data flows, or dependency trees.
3. **Decoupled Event-Driven Core:** All internal subsystems communicate asynchronously over a type-safe Event Bus, allowing dynamic plugin hooks and distributed scale-out.
4. **Context & Token Resource Boundaries:** Every token is budgeted. Code analysis must dynamically trade precision for cost using multi-model routing and adaptive code compression.
5. **Separation of Detection from Reasoning:** Pattern matchers and scanners generate raw observations; LLM agents analyze and verify observations, acting as judges rather than simple keyword parsers.

### 1.2 System Blueprint
The vNext architecture routes all repository inputs into a language-neutral intermediate representation, which is indexed and queried through a central engine before being analyzed by an agent pipeline.

```
┌────────────────────────────────────────── EVENT BUS ──────────────────────────────────────────┐
│                                                                                               │
│   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌─────────────────────┐   │
│   │   Scanner Subsystem       │───►│ Language Intelligence Lyr │───►│ Repository Intell.  │   │
│   │   • fast-glob / Ignore    │    │ • Language Packs          │    │ • Microservices     │   │
│   │   • Git-Aware Diffing     │    │ • Ghost IR Compiler       │    │ • Ontology Mapping  │   │
│   └───────────────────────────┘    └───────────────────────────┘    └─────────────────────┘   │
│                                                                                │              │
│                                                                                ▼              │
│   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌─────────────────────┐   │
│   │   Goal-Driven Planner     │◄───│     Query Engine          │◄───│  Storage Providers  │   │
│   │   • Scheduler & Workers   │    │     • Unified Query API   │    │  • SQLite / RocksDB │   │
│   │   • Priority Agent Loops  │    │     • Query Planner       │    │  • Vector DB / LMDB │   │
│   └───────────────────────────┘    └───────────────────────────┘    └─────────────────────┘   │
│                 │                                                                             │
│                 ▼                                                                             │
│   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌─────────────────────┐   │
│   │   Model Abstraction Lyr   │    │   Cost Optimization Lyr   │    │   Layered Memory    │   │
│   │   • LLM capability Router │◄───│   • Adaptive Chunking     │◄──►│   • Working/Session │   │
│   │   • NVIDIA/Ollama/OpenAI  │    │   • Model Routing Engine  │    │   • Evidence/Hypoth │   │
│   └───────────────────────────┘    └───────────────────────────┘    └─────────────────────┘   │
│                 │                                                                             │
│                 └──────────────────────────────┬──────────────────────────────────────────────┘
│                                                │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │     Detection & Reasoning Loop      │
                              │  Observation ──► Hypothesis         │
                              │       ▲               │             │
                              │       │               ▼             │
                              │  Verification ◄── Investigation     │
                              │       │                             │
                              │       ▼                             │
                              │  Confidence ──► Finding Lifecycle   │
                              └─────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │      Reporting & Action Engine      │
                              │  • JSON-LD / HTML / Markdown        │
                              │  • Auto-Fix Pull Requests           │
                              └─────────────────────────────────────┘
```

### 1.3 Deep Autopsy of GhostProto v0.2.2
The current architecture (v0.2.2) exhibits structural limitations that impede enterprise scalability:

* **Parsing & Scanner Bottlenecks:** Simple file-level globbing with extension-to-language mapping. Jumps directly to text regex checks. Lacks lexical understanding, scoping, type resolution, or import mapping.
* **Static Analysis Frailty:** Naive RegEx matchers in `secrets.ts` and `complexity.ts` produce high false-positive rates by flagging comments, test mocks, string literals, and dead code.
* **AI Context Fragmentation:** Arbitrary sliding window context matching based on file names. Truncates files at 60KB and discards vital cross-file context (e.g., interface definitions), causing hallucinated API assumptions.
* **Agentic Loop Congestion:** Single-agent, synchronous turn loop (up to 25 turns) calling basic file read/search tools. The single agent becomes bottlenecked executing linear tool calls sequentially.
* **Stateless Memory System:** The agent context is rebuilt each turn by appending raw history to system prompts. History serialization consumes exponential tokens per turn ($O(N^2)$ token growth).
* **Tight Model Coupling:** Hardcoded OpenAI-format client pointing to Nvidia NIM endpoints. Cannot use local offline models or enterprise VPC deployments without code modifications.

---

## Chapter 2: Language & Framework Intelligence Layer

The Language and Framework Intelligence Layer (LIL) represents the intermediate processing layer between file discovery and repository intelligence. It abstracts language-specific complexities by compiling ASTs into a unified intermediate representation.

```
                     ┌──────────────────────────────────┐
                     │          Ingest Engine           │
                     └──────────────────────────────────┘
                                      │
                                      ▼
                     ┌──────────────────────────────────┐
                     │    Tree-sitter Parser Manager    │
                     └──────────────────────────────────┘
                                      │
                                      ▼
                     ┌──────────────────────────────────┐
                     │          Language Packs          │
                     │  • Parser        • Resolver      │
                     │  • Detector      • Normalizers   │
                     └──────────────────────────────────┘
                                      │
                                      ▼
                     ┌──────────────────────────────────┐
                     │       Ghost IR Compiler          │
                     └──────────────────────────────────┘
                                      │
                                      ▼
                     ┌──────────────────────────────────┐
                     │  Framework-Specific Analyzers    │
                     │  • Next.js       • React         │
                     │  • NestJS        • Prisma        │
                     └──────────────────────────────────┘
```

### 2.1 Plug-and-Play Language Packs
Instead of hardcoding language support, GhostProto vNext introduces **Language Packs** which implement a common interface:

```typescript
export interface LanguagePack {
  languageId: string;
  extensions: string[];
  parse(source: string): ConcreteAST;
  resolveImports(ast: ConcreteAST, currentPath: string): ResolvedImport[];
  resolveTypes(ast: ConcreteAST): SymbolTypeMap;
  frameworkDetector(ast: ConcreteAST): string[];
  queries: Record<string, string>; // S-expressions for Tree-sitter
}
```

### 2.2 Ghost Intermediate Representation (Ghost IR)
To decouple analysis logic from source syntax, ASTs are compiled into **Ghost IR**, a language-neutral representation of code structure, symbols, control flows, and data definitions.

#### Ghost IR Schema Definition
```json
{
  "$schema": "https://ghostproto.org/schemas/ir/v1.json",
  "symbols": [
    {
      "id": "sym:src/db/mysql.ts:UserService:getUser",
      "name": "getUser",
      "kind": "Method",
      "parent": "sym:src/db/mysql.ts:UserService",
      "signature": {
        "parameters": [
          { "name": "userId", "type": "string" }
        ],
        "returnType": "Promise<User>"
      },
      "bodyRange": { "start": 42, "end": 65 },
      "controlFlow": {
        "blocks": [
          {
            "id": "block_0",
            "instructions": [
              {
                "op": "ASSIGN",
                "target": "queryStr",
                "args": ["SELECT * FROM users WHERE id = ", "userId"],
                "metadata": { "isConcat": true }
              },
              {
                "op": "CALL",
                "target": "this.db.execute",
                "args": ["queryStr"]
              }
            ],
            "successors": ["block_exit"]
          }
        ]
      }
    }
  ]
}
```

### 2.3 Framework Analyzer Layer
Framework-specific behaviors are isolated into **Framework Analyzers** that run on the compiled Ghost IR:
* **React/Next.js Analyzer:** Identifies Server Component vs. Client Component boundaries, raw SQL executions in Server Actions, and un-sanitized `dangerouslySetInnerHTML` injections.
* **NestJS Analyzer:** Identifies dependency injection graphs, middleware chains, route controllers, and guard decorators.
* **Prisma Analyzer:** Maps database access calls and traces schema relationships directly to database access locations.

---

## Chapter 3: Repository Intelligence Microservices

GhostProto vNext replaces the monolithic repository parser with six independent microservices, each running in their own processes and communicating over the Event Bus.

```
                          ┌──────────────────────────┐
                          │  Repository Intelligence │
                          └──────────────────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼              ▼
  ┌───────────┐  ┌───────────┐  ┌─────────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │   Index   │  │   Graph   │  │  Metadata   │  │  Metrics  │  │ Embedding │  │ Knowledge │
  │  Service  │  │  Service  │  │   Service   │  │  Service  │  │  Service  │  │  Service  │
  └───────────┘  └───────────┘  └─────────────┘  └───────────┘  └───────────┘  └───────────┘
```

### 3.1 Deconstructed Services
1. **Index Service:** Manages symbol indices, import maps, and prefix tries. Exposes fast symbol resolution APIs.
2. **Graph Service:** Manages multi-representation code relationship graphs. Builds and queries call graphs and data-flow graphs.
3. **Metadata Service:** Collects git configurations, file metadata, commit histories, and author attributions.
4. **Metrics Service:** Computes complexity metrics, nesting levels, line-of-code distributions, and test coverage ratios.
5. **Embedding Service:** Generates semantic code embeddings and manages semantic search indexing.
6. **Knowledge Service:** Tracks structured findings, evidence chains, and historical audit histories across runs.

---

### 3.2 Formal Ontology Schema
To ensure semantic consistency across all graphs and microservices, the system enforces a strict ontology.

```
   [ Repository ] ──( HAS_MODULE )──► [ Module ] ──( CONTAINS )──► [ File ]
                                                                       │
                                                                 ( DECLARES )
                                                                       │
                                                                       ▼
                                                                  [ Symbol ]
                                                                       │
                             ┌─────────────────┬───────────────────────┼──────────────────────┐
                             │                 │                       │                      │
                        ( CALLS )         ( INHERITS )            ( WRITES )              ( READS )
                             │                 │                       │                      │
                             ▼                 ▼                       ▼                      ▼
                        [ Symbol ]        [ Symbol ]              [ Symbol ]             [ Symbol ]
```

#### Entities
* **Repository:** Root entity representing the codebase.
* **Module:** Dynamic namespace boundaries defined by package manifests.
* **File:** Physical source file path.
* **Symbol:** Function, method, class, variable, or interface declaration.
* **Route:** HTTP/gRPC routing boundary definitions.
* **Database:** DB Schema definitions, tables, and column metadata.
* **Secret:** Hardcoded credential strings.
* **Finding:** Formal security or quality issue representation.
* **Evidence:** AST range, call path, or data flow proving a finding.
* **Observation:** Raw issue reported by static scanners.
* **Policy:** Compliance rules (e.g., PCI-DSS Requirement 6.5).

#### Relationships
* **CALLS:** Mapped caller-to-callee methods.
* **IMPORTS:** Reference import statements.
* **USES:** Class-to-interface implementation or type usage.
* **OWNS:** Code ownership mapping from git configurations.
* **DEPENDS_ON:** Package-to-package dependency associations.
* **READS / WRITES:** Variable or database access patterns.
* **AUTHENTICATES:** Middleware endpoint validations.
* **SANITIZES:** Code sanitization locations that clear tainted variables.
* **FLOWS_TO:** Data-flow path tracing source-to-sink variable propagation.

---

## Chapter 4: Storage Providers & Query Engine

```
       ┌────────────────────────────────────────────────────────┐
       │                  Unified Query Engine                  │
       └────────────────────────────────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                     Query Planner                      │
       │  • Parses query intent into concrete execution steps   │
       └────────────────────────────────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │               Storage Provider Abstraction             │
       └────────────────────────────────────────────────────────┘
                                   │
       ┌───────────┬───────────────┼───────────────┬────────────┐
       ▼           ▼               ▼               ▼            ▼
   ┌───────┐   ┌───────┐       ┌───────┐       ┌───────┐   ┌────────┐
   │ Rocks │   │SQLite │       │ LMDB  │       │ Duck  │   │ Memory │
   │  DB   │   │       │       │       │       │  DB   │   │        │
   └───────┘   └───────┘       └───────┘       └───────┘   └────────┘
```

### 4.1 Storage Provider Interface
GhostProto vNext abstracts physical databases behind a interchangeable **Storage Provider** interface:

```typescript
export interface StorageProvider {
  initialize(dbPath: string): Promise<void>;
  put(prefix: string, key: string, value: Buffer): Promise<void>;
  get(prefix: string, key: string): Promise<Buffer | null>;
  delete(prefix: string, key: string): Promise<void>;
  queryPrefix(prefix: string, keyPrefix: string): AsyncIterable<[string, Buffer]>;
  close(): Promise<void>;
}
```
* **Supported Backends:** RocksDB (for local persistent caches), SQLite (for structural metadata tables), LMDB (for fast in-memory key-value lookups), DuckDB (for analytical queries on metrics), and a memory-backed cache.

### 4.2 Query Engine as the Core Abstraction
No internal system component, plugin, or agent accesses files or databases directly. Everything runs queries through the **Query Engine** using a query syntax ("SQL for repositories"):

```typescript
export interface QueryPlan {
  steps: QueryStep[];
  costEstimate: number;
}

export class QueryEngine {
  constructor(private storage: StorageProvider) {}

  public planQuery(intent: string): QueryPlan {
    // Parse intent into index queries and graph traversals
    return {
      steps: [
        { type: 'INDEX_LOOKUP', target: 'Route', key: '/api/v1/auth' },
        { type: 'GRAPH_TRAVERSE', relation: 'CALLS', depth: 3 }
      ],
      costEstimate: 0.05
    };
  }

  public async execute<T>(plan: QueryPlan): Promise<T> {
    // Coordinate query execution with caching and batching
    return {} as T;
  }
}
```

---

## Chapter 5: Static Analysis 2.0, Rule Engine & DSL

To prevent coupling rules to TypeScript files, GhostProto vNext introduces a decoupled **Rule Engine** that evaluates code issues using a custom **Rule DSL**.

```
                ┌──────────────────────────────────────┐
                │          Yaml Rule Packs             │
                └──────────────────────────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────────┐
                │            Rule Registry             │
                │        • Validates and loads         │
                └──────────────────────────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────────┐
                │            Rule Engine               │
                └──────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
     ┌─────────────────────┐               ┌─────────────────────┐
     │ AST Pattern Matcher │               │ Dataflow Evaluator  │
     │ • S-Expressions     │               │ • Taint Tracing     │
     └─────────────────────┘               └─────────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────────┐
                │            Observations              │
                └──────────────────────────────────────┘
```

### 5.1 Rule DSL Schema
Rules are defined using YAML-based rule packs, matching patterns against Ghost IR:

```yaml
id: gp-sec-sqli
name: Unsanitized SQL Concatenation
severity: critical
category: security
target: GhostIR
patterns:
  - pattern-either:
      - pattern: |
          ASSIGN:
            target: $VAR
            args: [ ..., $USER_INPUT, ... ]
            metadata: { isConcat: true }
      - pattern: |
          CALL:
            target: db.query
            args: [ $VAR ]
condition:
  tainted:
    source: req.body
    sink: db.query
    sanitize: sanitizeString
message: "SQL Injection risk: un-sanitized variable $VAR flows to SQL query execution."
```

### 5.2 Rule Engine & Registry
* **Rule Registry:** Validates loaded rule packs, indexes rules by target types, and coordinates rule updates.
* **Rule Engine:** Evaluates registered rules. It maps patterns to AST configurations, queries the call graph, resolves variable taint states, and emits raw **Observation** objects.

---

## Chapter 6: AI Intent-Based Retrieval & Cost Optimization

Instead of providing AI agents with low-level data-querying APIs, GhostProto vNext uses an **Intent-Based AI Retrieval** layer. Agents declare query intents rather than coordinating specific steps.

```
                    ┌──────────────────────────────┐
                    │      Agent Query Intent      │
                    │      (e.g., Trace Auth)      │
                    └──────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      Query Planner           │
                    │   • Resolve to query plans   │
                    └──────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │    Cost Optimization Layer   │
                    │   • Token & Budget check     │
                    └──────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       Query Engine           │
                    │   • Execute plan in parallel │
                    └──────────────────────────────┘
```

### 6.1 Intent Resolving Examples
* **Agent Request:**
  `queryEngine.resolveIntent('TraceAuth', { endpoint: '/login' })`
* **Query Planner Processing:**
  Resolves the intent into steps:
  1. Lookup the Route node matching `/login` in the Route Graph.
  2. Query the Route Handler Controller symbol definition.
  3. Query imports to find active authentication middleware references.
  4. Trace data flow paths from the request parameters to validation blocks.
* **Result Assembly:**
  Packs syntax configurations, dependency states, and data paths into an evidence package, compressing the output to minimize token consumption before returning it to the agent.

---

## Chapter 7: Multi-Agent System, Goal Planner & Scheduler

GhostProto vNext decouples agent task coordination from scheduling and thread executions, introducing a dedicated **Goal Planner** subsystem.

```
                            [ Goal Submitted ]
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │        Goal Planner         │
                      │  • Resolve goals to tasks   │
                      └─────────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    Multi-Agent Scheduler    │
                      │  • Schedules task queues    │
                      └─────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
   ┌─────────────┐             ┌─────────────┐             ┌─────────────┐
   │ Security A. │             │  Database A.│             │  Architect A.│
   └─────────────┘             └─────────────┘             └─────────────┘
```

### 7.1 Goal Planner Subsystem
The **Goal Planner** parses high-level audit intents (e.g., "Run complete security audit targeting PCI compliance") and generates an execution plan consisting of distinct tasks:
1. Initialize Language Intelligence Layer on modified paths.
2. Build data-flow graphs targeting database access boundaries.
3. Trigger Security Agent loops on identified routes.
4. Execute Consensus verification steps on potential vulnerability findings.

### 7.2 Scheduler Subsystem
The **Scheduler** processes planned tasks using thread pools:
* **Worker Threads:** Executes compute-heavy parsing, static evaluations, and graph traversals in Node worker pools.
* **Priority scheduling:** Schedules agent turns according to priority flags, preempting low-priority tasks if resource budgets are exceeded.

---

## Chapter 8: Memory Systems & Knowledge Evolution

### 8.1 Layered Memory Cache System
To optimize latency and reduce token consumption, memory is segmented into distinct layers:

```
┌─────────────────────────── MEMORY CONTROLLER ──────────────────────────┐
│                                                                        │
│   ┌───────────────────────────┐          ┌───────────────────────────┐ │
│   │   Working Memory          │          │   Scratchpad              │ │
│   │   • Current turn context  │          │   • Subtask memory        │ │
│   └───────────────────────────┘          └───────────────────────────┘ │
│                 │                                      │               │
│                 ▼                                      ▼               │
│   ┌───────────────────────────┐          ┌───────────────────────────┐ │
│   │   Evidence Store          │          │   Hypothesis Store        │ │
│   │   • SQL validation facts  │          │   • Suspected paths       │ │
│   └───────────────────────────┘          └───────────────────────────┘ │
│                 │                                      │               │
│                 ▼                                      ▼               │
│   ┌───────────────────────────┐          ┌───────────────────────────┐ │
│   │   Session Memory          │          │   Persistent Cache        │ │
│   │   • CLI execution data    │          │   • RocksDB cross-run     │ │
│   └───────────────────────────┘          └───────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

* **Working Memory:** Local V8 variables containing immediate loop states. Cleared after each turn.
* **Scratchpad:** Text buffers used by agents during intermediate reasoning tasks. Cleared on task completion.
* **Repository Context:** LRU memory cache storing mapped files and graph scopes.
* **Evidence Store:** Relational SQLite tables containing verified findings, AST references, and data-flow sequences.
* **Hypothesis Store:** SQLite tables tracking active vulnerability proposals and validation histories.
* **Finding Cache:** Local Redis or RocksDB cache storing identified codebase issues to prevent redundant checks.
* **Session Memory:** RocksDB storage containing trace logs and budget limits.
* **Persistent Cache:** Multi-month RocksDB cache containing historical codebase baselines.

### 8.2 Knowledge Evolution Pipeline
Observations are processed through a structured lifecycle to track code context evolution:

```
    [ Observation ] ──► [ Knowledge ] ──► [ Finding ] ──► [ Historical Pattern ]
```
1. **Observation:** A pattern matcher detects a raw vulnerability signature.
2. **Knowledge:** The system validates the AST, resolves symbol references, and links it to the call graph.
3. **Finding:** The system verifies the finding against policies, confirms execution reachability, and records it as verified.
4. **Historical Pattern:** The finding is logged in the persistent baseline, allowing subsequent incremental runs to track code evolution.

---

## Chapter 9: Detection, Reasoning, & Finding Lifecycle

### 9.1 Finding Fingerprinting
To track issues across renames, refactoring, and commit cycles, GhostProto vNext implements **Finding Fingerprinting**:
* **Structural Hash:** Generates a hash using the surrounding AST structure rather than absolute line numbers.
  $$\text{Hash} = \text{SHA-256}(\text{GhostIR}_{\text{decl}} \parallel \text{Context}_{\text{signature}})$$
* **Git Blame Integration:** Queries git to determine symbol authorship, creation commits, and historical regression states.
* **Suppressions & Baselines:** Suppressions are defined using structural hashes inside `.ghostproto/suppress.json` to prevent recurring alerts.

---

### 9.2 Compliance Policy Engine
Findings are validated against compliance policies defined in a Policy Engine:

```json
{
  "policyName": "PCI-DSS-Requirements",
  "rules": [
    {
      "id": "pci-6.5.1",
      "severityLimit": "critical",
      "allowGPL": false,
      "enforceSanitizers": ["sanitizeString", "escapeHtml"],
      "action": "BLOCK_BUILD"
    }
  ]
}
```
The Policy Engine evaluates each verified finding against active policies, updating status codes to block CI/CD runs if violations occur.

---

## Chapter 10: Event Bus, Incremental Updates, & Plugins

### 10.1 Event Bus Event List
The decoupled subsystems communicate by emitting events on a type-safe Event Bus:

| Event Type | Payload | Emitted By | Target Consumers |
| :--- | :--- | :--- | :--- |
| `scan:diff` | `{ modifiedFiles: string[], gitCommit: string }` | Scanner Subsystem | Ingest Service, Graph Service |
| `ast:parsed` | `{ path: string, ir: GhostIR }` | Language Intelligence | Index Service, Graph Service |
| `graph:updated` | `{ affectedNodes: string[] }` | Graph Service | Static Rule Engine |
| `finding:detected` | `{ observation: Observation }` | Rule Engine | AI Goal Planner, Scheduler |
| `finding:verified` | `{ finding: Finding }` | Agent Judge | Policy Engine, Reporting Engine |

### 10.2 Dynamic Plugin Registration
Plugins register event consumers dynamically, extending analysis pipelines without modifying the core orchestrator.

---

## Chapter 11: Enterprise Architecture & Scaling Profiles

To support enterprise operations, GhostProto vNext introduces workspaces, permissions, and scaling configurations.

### 11.1 Scaling Profiles

```
┌────────────────────────────────────────────────────────┐
│               ENTERPRISE SCALING PROFILE               │
├───────────────────────┬────────────────────────────────┤
│       Repository Size │    Subsystem Allocation        │
├───────────────────────┼────────────────────────────────┤
│ 1. < 1,000 files      │ SQLite (In-Memory), Local      │
│ 2. 1,000 - 10,000     │ SQLite (Disk), 4-Worker Pool   │
│ 3. 10,000 - 50,000    │ RocksDB, 16-Worker Pool        │
│ 4. > 50,000 files     │ RocksDB Cluster, Vector SaaS   │
└───────────────────────┴────────────────────────────────┘
```

### 11.2 Enterprise Integrations
* **Repository Permission Gates:** Enforces security permissions at file, module, and repository levels to protect sensitive code blocks during multi-user runs.
* **Distributed Cloud Workers:** Analysis tasks are scheduled across Kubernetes clusters, running isolated containers to execute high-volume scans.
* **Audit History & Compliance Portals:** Stores audit records in secure databases to generate compliance reports (e.g., SOC2, ISO27001).

---

## Chapter 12: Testing, Evaluation Pipelines & GhostBench

To maintain accuracy and prevent regressions, GhostProto vNext implements an evaluation pipeline and a dedicated benchmarking dataset.

### 12.1 GhostBench Dataset
**GhostBench** is a testing dataset containing vulnerability patterns:

| Vulnerability Type | Test Case Count | Expected Finding | Verification Method |
| :--- | :--- | :--- | :--- |
| **SQL Injection** | 150 cases | `gp-sec-sqli` | Taint path resolved to query sink |
| **XSS** | 100 cases | `gp-sec-xss` | Un-sanitized UI context interpolation |
| **SSRF** | 80 cases | `gp-sec-ssrf` | HTTP client input source reachability |
| **Path Traversal** | 90 cases | `gp-sec-pathtraversal` | Unvalidated path string parameters |
| **Secrets Exposure** | 200 cases | `gp-sec-hardcodedkey` | Entropy and regex key signatures |

### 12.2 AI Prompt & Pipeline Evaluation
Every prompt update and agent modification is evaluated through the evaluation pipeline:

```
   [ Updated Prompt ] ──► [ Run GhostBench ] ──► [ Evaluator Judge ] ──► [ Human Label ] ──► [ Save Baseline ]
```
* **Precision/Recall Targets:** Prompt modifications must maintain precision $> 95\%$ and recall $> 90\%$ before being merged.

---

## Chapter 13: Technical Decision Records (TDRs)

### TDR-01: Language-Agnostic AST Parsing via Tree-sitter
* **Status:** APPROVED  
* **Context:** v0.2.2 relies on regular expressions, leading to parsing errors and false positives. We require syntactical analysis to trace parameters and evaluate expressions.  
* **Decision:** We implement Tree-sitter C-bindings as Node native modules. We construct concrete syntax trees and use compiled tree queries to retrieve AST structures.  
* **Tradeoffs:** Increases build complexity during module compilation, but provides parser reliability and performance during incremental edits.

### TDR-02: RocksDB-Backed Graph & Index Storage
* **Status:** APPROVED  
* **Context:** Graph structures representing repositories with over 10,000 files exceed memory limits when stored using JavaScript object allocations. We require a persistent database backend that supports fast lookups.  
* **Decision:** Implement RocksDB as the local store. Node objects are serialized using Protocol Buffers and stored as binary values to optimize read and write operations.  
* **Tradeoffs:** Introduces native database binaries, but provides consistent performance under low memory conditions.

### TDR-03: Event-Driven Multi-Agent Protocol
* **Status:** APPROVED  
* **Context:** Linear agent execution loops are slow. We require a decoupled architecture where specialized agents can run in parallel.  
* **Decision:** Decouple agents and execute tasks asynchronously using a centralized Event Bus. Agents register as event consumers, executing and verifying findings in parallel worker threads.  
* **Tradeoffs:** Increases debugging complexity, but prevents blockages and supports distributed scale-out.

### TDR-04: Language-Neutral Ghost IR
* **Status:** APPROVED  
* **Context:** Implementing static analysis rules for multiple target languages requires separate rule sets per language. We require an intermediate representation to compile multiple syntaxes into a common format.  
* **Decision:** Implement Ghost IR as the compiler target for all Language Packs. Analyzers, graph engines, and retrieve systems evaluate Ghost IR instead of concrete syntax trees.  
* **Tradeoffs:** Introduces translation latency, but simplifies analyzer rules and parser integrations.

### TDR-05: Storage Provider Interface
* **Status:** APPROVED  
* **Context:** Coupling the storage layer to RocksDB limits execution choices (e.g., in browser-based tools or offline environments). We require a storage abstraction layer.  
* **Decision:** Abstract database implementations behind a `StorageProvider` interface, allowing interchangeable backends (SQLite, RocksDB, in-memory, LMDB).  
* **Tradeoffs:** Introduces serialization overhead, but provides cross-platform flexibility.

---

## Chapter 14: Seven-Stage Evolution Roadmap

```
  v1: Compiler Found. ──► v2: Repo Intell. ──► v3: Query Platform ──► v4: Agent Reason. ──► v5: Enterprise ──► v14: Terminal UX
    • Language Packs       • Graph Engine        • Query Engine        • Planner / Scheduler  • Workspaces           • Interactive Console
    • Ghost IR             • Vector Embed.       • Storage Provider    • Consensus Judge      • Policy Engine        • Syntax & Git Diff
```

### Stage 1: Compiler Foundation (Months 0 - 6)
* **Milestones:** Build Language Packs, design the Ghost IR specification (TDR-04), and compile concrete syntax trees to IR.
* **Dependencies:** Tree-sitter integrations.
* **Complexity:** High.

### Stage 2: Repository Intelligence (Months 6 - 12)
* **Milestones:** Implement the 6 deconstructed services, map ontology relationships, and build the call/data-flow graphs.
* **Dependencies:** Stage 1 compiler structures.
* **Complexity:** High.

### Stage 3: Query Platform (Months 12 - 18)
* **Milestones:** Define the `StorageProvider` interface (TDR-05), implement RocksDB/SQLite backends, and build the central Query Engine.
* **Dependencies:** Stage 2 services.
* **Complexity:** Medium.

### Stage 4: Multi-Agent Reasoning (Months 18 - 24)
* **Milestones:** Build the Goal Planner, Scheduler task queues, capability-based model routers, and consensus validation judges.
* **Dependencies:** Stage 3 Query Engine.
* **Complexity:** High.

### Stage 5: Enterprise Intelligence (Months 24 - 36)
* **Milestones:** Policy Engine integration, multi-user workspaces, workspace permission gates, finding fingerprinting, and audit histories.
* **Dependencies:** Stage 4 agent structures.
* **Complexity:** Medium.

### Stage 6: Distributed Analysis Platform (Months 36 - 48)
* **Milestones:** Distributed cloud workers, Kubernetes scheduling, high-scale database cluster backends.
* **Dependencies:** Stage 5 configurations.
* **Complexity:** High.

### Stage 7: Autonomous Code Intelligence (Months 48 - 60)
* **Milestones:** Auto-remediation pipelines, pull request generation, and self-improving prompt evaluation pipelines.
* **Dependencies:** Stage 6 platforms.
* **Complexity:** Very High.

### Stage 14: Advanced Terminal Interface & CLI UX (vNext Console)
* **Milestones:** Focus entirely on CLI enhancement. Redesign terminal visualizations (tables, progress bars, colored code blocks). Implement interactive review mode (interactive CLI menus for traversing audit findings and viewing full code diffs/fixes). Support direct file auto-fixing/patching from the terminal. Remove/decouple Tauri desktop dependencies to maintain a lean, high-fidelity command-line experience.
* **Dependencies:** None.
* **Complexity:** Medium.

