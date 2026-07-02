# 🔍 GhostProto — Detailed Project Brief & Architecture Specification

> **Version:** 0.2.2  
> **Author:** Shehryar Sohail (GhostCache_)  
> **License:** MIT  
> **Repo:** https://github.com/AtlasRoX/Ghost-Proto  
> **CLI Commands:** `ghostch` / `ghostproto`  
> **Node Requirement:** >= 18.0.0  

---

## 1. Executive Summary & Design Vision

**GhostProto** is an advanced, production-grade, AI-powered codebase auditor designed to perform deep, evidence-based security, quality, performance, and architecture reviews. Unlike basic static linters that rely solely on pattern-matching rules, GhostProto bridges the gap between deterministic static analysis and semantic intelligence by orchestrating a dedicated **one-shot or multi-turn agentic loop** powered by Nvidia NIM models.

### Primary Goals:
1. **Zero-Hallucination Audits:** GhostProto enforces an "evidence-required" mandate. Every finding produced by the agentic loop must be verified by reading actual code blocks via tool execution, reporting exact line numbers, code snippets, and custom-tailored fixes.
2. **Deep Semantic Reasoning:** Investigates security anti-patterns (such as weak cryptographic choices, unchecked command injections, and unsafe deserialization) and architectural leaks (such as circular dependencies and leaky boundaries) that traditional static AST parsers struggle to detect.
3. **Extremely Low Overhead & High Guardrails:** Features strict token budgeting, turn-ceiling circuit breakers, automatic repetition detectors, and sandboxed, read-only filesystem paths to guarantee safe and cost-effective execution.

---

## 2. Technical Stack

GhostProto is built using a modern, lightweight, type-safe stack:

*   **Runtime Environment:** Node.js (version `>= 18.0.0`)
*   **Programming Language:** TypeScript (version `^5.4.5`), compiled to standard ES6 JavaScript.
*   **CLI Parsing & Framework:** `commander` (version `^12.1.0`) for interactive argument, subcommand, and option parsing.
*   **Terminal Visuals:** `chalk` (version `^4.1.2`) for rich color rendering and `ora` (version `^5.4.1`) for sleek progress spinners.
*   **Filesystem Scanning:** `fast-glob` (version `^3.3.2`) for high-performance pattern-based directory traversal and `ignore` (version `^5.3.2`) for parsing `.gitignore` rules.
*   **External AI Engine:** Nvidia NIM Chat Completion API (`https://integrate.api.nvidia.com/v1/chat/completions`) using fallback models:
    *   *Ultra-tier:* `nvidia/nemotron-3-ultra-550b-a55b` (heavyweight reasoning)
    *   *Super-tier:* `nvidia/nemotron-3-super-120b-a12b` (balanced execution)
    *   *Core-tier:* `nvidia/llama-3.3-nemotron-super-49b-v1` (fast and responsive)
*   **Test Suite:** Jest (`^30.3.0`) + `ts-jest` for automated test orchestration.

---

## 3. High-Level System Architecture

GhostProto follows a modular, decoupled architecture, separating the core orchestration logic, static check pipelines, AI/Agent components, and reporting engines.

```mermaid
graph TD
    CLI[CLI Entrypoint: src/index.ts] --> Orchestrator[Orchestrator: src/core/auditor.ts]
    Orchestrator --> Scanner[Project Scanner: src/core/scanner.ts]
    
    Orchestrator --> StaticAnalyzers[Static Analyzers]
    subgraph StaticAnalyzers [Static Analyzers]
        Secrets[Secrets & Vulnerabilities: secrets.ts]
        Deps[Dependency Analyzer: dependencies.ts]
        Complexity[Complexity & Quality: complexity.ts]
    end

    Orchestrator --> AIEngines[AI Analysis Engines]
    subgraph AIEngines [AI Analysis Engines]
        OneShot[One-Shot AI: ghostproto-analyzer.ts]
        Agentic[Agentic Loop: agent-loop.ts]
    end

    Agentic --> AgentTools[Agent Tools: tools.ts]
    subgraph AgentTools [Agent Tools]
        list_files[list_files]
        read_file[read_file]
        search_code[search_code]
        read_dep_manifest[read_dependency_manifest]
        get_proj_summary[get_project_summary]
        get_static_findings[get_static_findings]
        finalize_audit[finalize_audit]
    end

    AIEngines -.-> NIM[Nvidia NIM API]
    
    Orchestrator --> Reporters[Reporters]
    subgraph Reporters [Reporters]
        Terminal[Terminal: terminal.ts]
        AgentLog[Agent Log: agent-log.ts]
        Markdown[Markdown: markdown.ts]
        HTML[HTML Dashboard: html.ts]
        JSON[JSON: json.ts]
    end
```

### The Request Lifecycle:
1. **Initialization:** The user invokes `ghostch [path]` with options (e.g. `--static`, `--fast`, `--verbose`, or custom token budgets).
2. **Scanning:** [scanner.ts](file:///a:/claude-audit-main/claude-audit-main/src/core/scanner.ts) maps the project, respects `.gitignore`, filters binary or excessive files, and identifies frameworks/testing suites.
3. **Static Check Phase:** [auditor.ts](file:///a:/claude-audit-main/claude-audit-main/src/core/auditor.ts) invokes static detectors sequentially (secrets, dependencies, and basic complexity metrics).
4. **AI Reasoning Phase:** 
    *   *Static Mode:* Skips AI entirely.
    *   *One-Shot Mode:* Truncates code to fit a 60KB sliding window context, requests Nvidia NIM API, and outputs structured findings.
    *   *Agentic Mode:* Initializes the [agent-loop.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/agent-loop.ts). The agent dynamically issues read-only tool calls to inspect files and search code, feeding results back into its context until calling `finalize_audit`.
5. **Score Merge & Grade Calculation:** Combines static findings with AI findings. Applies penalties based on severity (Critical = 15/20pts, High = 8/10pts, Medium = 4/5pts, Low = 2pts).
6. **Reporting:** Generates outputs based on flags (stdout console, markdown file, interactive HTML dashboard, or JSON).

---

## 4. In-Depth Component Specifications

### 4.1 Core Orchestration & Scanning
*   **Orchestrator ([src/core/auditor.ts](file:///a:/claude-audit-main/claude-audit-main/src/core/auditor.ts)):**
    Coordinates the entire flow. It weights categories to calculate the project's overall score:
    $$\text{Overall Score} = \frac{\sum (\text{Category Score} \times \text{Weight})}{\sum \text{Weights}}$$
    *Category Weights:* Security (25%), Quality (20%), Performance (15%), Architecture (15%), Dependencies (10%), Testing (10%), Documentation (5%).
*   **Scanner ([src/core/scanner.ts](file:///a:/claude-audit-main/claude-audit-main/src/core/scanner.ts)):**
    *   *Language Support:* Maps extensions (e.g., `.ts`, `.py`, `.go`, `.rs`, `.java`, `.cpp`, `.cs`, `.php`, `.rb`, `.dockerfile`) to their formal language names.
    *   *Framework Detection:* Scans package files (like `package.json`) to detect React, Next, Vue, Express, NestJS, Django, Flask, FastAPI, Laravel, Rails, Gin, Fiber, Prisma, Drizzle, and TailwindCSS.
    *   *Test Suites:* Auto-detects Jest, Vitest, Mocha, Pytest, RSpec, JUnit, or Cargo-test formats.
    *   *Package Manager Detection:* Locates lockfiles (`yarn.lock`, `package-lock.json`, `pnpm-lock.yaml`, `requirements.txt`, `Cargo.toml`, etc.) to tag the environment.

### 4.2 Static Analyzers
*   **Secrets Analyzer ([src/analyzers/static/secrets.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/static/secrets.ts)):**
    Uses specific regular expressions to inspect files for critical security risks:
    *   *Hardcoded Keys:* Matches API keys (`api-key`, `sk-ant-...`, `sk-...`), AWS Access keys (`AKIA...`), GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`), and private key blocks (`-----BEGIN PRIVATE KEY-----`).
    *   *XSS & Injection Risks:* Scans for `eval()`, SQL string concatenations inside raw query boundaries, and un-sanitized `dangerouslySetInnerHTML`.
    *   *Insecure Crypto:* Catches `Math.random()` used in security contexts (tokens, salts, passwords, nonces).
    *   *Disabled SSL:* Highlights parameters like `verify = False` or `rejectUnauthorized: false` in communication blocks.
    *   *Subprocess Insecure Shell Execution:* Detects `shell=True` in Python subprocess commands.
*   **Dependency Analyzer ([src/analyzers/static/dependencies.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/static/dependencies.ts)):**
    *   *CVE Matching:* Checks declared dependencies against known vulnerability patterns (e.g., lodash prototype pollution, axios SSRF, follow-redirects header exposure).
    *   *Deprecation Checking:* Warns against deprecated or bloated libraries (e.g., suggesting migrating from `moment` to `date-fns`/`dayjs`, or `request` to `axios`/`fetch`).
    *   *Dependency Bloat:* Flags alerts if the project declares more than 100 dependencies, increasing security attack vectors and bundle size.
*   **Complexity & Quality Analyzer ([src/analyzers/static/complexity.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/static/complexity.ts)):**
    *   *File Size:* Flags code files exceeding 500 lines as targets for splitting.
    *   *Deep Nesting:* Tallies indentation brackets to flag deeply nested logic (indentation level > 5).
    *   *Line Length:* Finds lines exceeding 120 characters (excluding comments).
    *   *Leftover Debug Hooks:* Detects active `debugger`, `alert()`, `console.log`, or `var_dump()` calls.
    *   *Duplicate Imports:* Identifies multiple import lines pulling from the same module.
    *   *Test Coverage Index:* Checks the ratio of test files to source files, warning if it falls below 10%.

### 4.3 AI Analysis Engines
*   **One-Shot AI Analyzer ([src/analyzers/ai/ghostproto-analyzer.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/ghostproto-analyzer.ts)):**
    Consolidates the codebase into a single request. It scores files based on their names (prioritizing `index`, `main`, `auth`, `api`, `config`, and subtracting test or mock directories) to build a focused codebase representation. It issues a structured JSON instructions prompt, forcing the LLM to output only raw JSON fitting the `AIAuditResponse` schema.
*   **Agentic Loop Analyzer ([src/analyzers/ai/agent-loop.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/agent-loop.ts)):**
    Implements a stateful loop where the AI agent is given a set of narrow read-only capabilities. It operates under four guardrails:
    1.  **Iteration Circuit Breaker:** Ceases execution if it reaches `maxTurns` (default 25) without submitting.
    2.  **Token Budget Ceiling:** Monitors cumulative token counts. If usage exceeds the limit, it stops and merges current findings with static data.
    3.  **Repetition Detector:** Hashing tool names and canonical parameter structures (SHA-1). If the same tool call is requested 3 times within a rolling window of 6 calls, the loop aborts.
    4.  **Error Isolation:** Tool execution catches all throws internally, returning the error as content to the LLM to keep the agent loop running.

### 4.4 Sandboxed Agent Tools ([src/analyzers/ai/tools.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/tools.ts))
To prevent filesystem mutation, code execution, or data theft, the agent is restricted to these read-only, sandboxed tools:
1.  **`list_files`:** Returns list of file paths. Capped at 500 files; ignores dependencies and build assets.
2.  **`read_file`:** Reads line ranges. Refuses to load files larger than 200KB to prevent context overflow.
3.  **`search_code`:** Executes literal or regex pattern searches across files.
4.  **`read_dependency_manifest`:** Focuses specifically on package files.
5.  **`get_project_summary`:** Provides high-level project statistics.
6.  **`get_static_findings`:** Lists initial findings from the static checks, forcing the agent to build upon them rather than repeat them.
7.  **`finalize_audit`:** Takes the final JSON report payload, closing the loop.

---

## 5. In-Depth Application Feature Set

GhostProto is equipped with a rich set of capabilities designed for flexible execution, pipeline automation, and safety:

### 5.1 CLI subcommands and Configuration
*   **API Key Management:** The `key <value>` subcommand registers and securely persists the Nvidia NIM API Key in `~/.ghostproto.json`. Alternatively, the tool checks the `GHOSTPROTO_API_KEY` environment variable.
*   **Path-Targeted Execution:** Supports auditing the current directory (`.`) or any specified path (e.g. `ghostch ./sub-project`).

### 5.2 Granular Category Filtering
Users can isolate audits to specific categories using the `-c` or `--categories` option. Valid categories include:
*   `security`: Inspects vulnerable syntax, hardcoded secrets, injection vectors, and weak cryptography.
*   `quality`: Finds large files, deep nesting, duplicate imports, and leftover debug logs.
*   `performance`: Identifies sync I/O in hot paths, expensive operations, and resource leaks.
*   `architecture`: Detects circular dependencies, abstraction leaks, and structural flaws.
*   `dependencies`: Matches versions against known vulnerabilities and identifies unmaintained packages.
*   `testing`: Verifies test directory setups, coverage indexes, and framework integrations.
*   `documentation`: Evaluates API comment coverage, readme existence, and docstring formatting.

### 5.3 Execution Modes (Static, One-Shot, and Agentic)
GhostProto scales its execution based on performance, cost, and depth preferences:
1.  **Pure Static Mode (`--static`):** Bypasses all AI calls. Runs local regex patterns and AST-equivalent scans for instant, offline, and zero-cost audits.
2.  **One-Shot AI Mode (`--fast`):** Packages a prioritized codebase context (up to 60KB characters) and completes the audit in a single external API request.
3.  **Agentic Mode (Default):** Spawns a stateful, autonomous investigator equipped with sandboxed tools that can browse files, search code, and trace issues dynamically before concluding.

### 5.4 Multi-Tier Model Fallbacks
To prevent API failures or rate-limiting blockages, the reasoning loop employs an automatic fallback array. If the selected model fails, it tries:
1.  `nvidia/nemotron-3-ultra-550b-a55b` (Deep Reasoning)
2.  `nvidia/nemotron-3-super-120b-a12b` (Balanced Analysis)
3.  `nvidia/llama-3.3-nemotron-super-49b-v1` (High-speed Fallback)

### 5.5 Safety Limits & Budgets
*   **Token Budget Ceiling (`--max-budget <tokens>`):** A hard cap on cumulative tokens (input + output). If the limit is reached mid-run, the engine shuts down the agentic loop gracefully, returning a merged report of current findings.
*   **Turn Cap (`--max-turns <n>`):** Sets the maximum number of tool-use iterations (default 25) to prevent infinite loops.
*   **File Size Guardrails (`--max-file-size <kb>`):** Ignores single source files larger than the specified threshold (default 100KB) to protect context windows.

### 5.6 Telemetry & Compliance Tracing
*   **Telemetry Logs:** When running in agentic mode, GhostProto automatically writes a detailed `.ghostproto/agent-trace.jsonl` log. 
*   **Trace Records:** Each record documents the turn index, unique Claude correlation ID, tool name, parsed parameters, byte count, execution latency (in milliseconds), token costs, and a preview of the returned result.

### 5.7 CI/CD Automation
*   **Machine-Readable Streams (`--json`):** Disables interactive animations, spinner outputs, and colored bars, dumping pure JSON directly to `stdout` for programmatic analysis.
*   **Status Codes:** Exits with code `1` if critical-severity issues are uncovered, allowing pipelines to block deployment. Exits with code `2` on execution errors.

---

## 6. Visual Presentation & UI/UX Design System

GhostProto prioritizes design details to make reports engaging and clear:

### 6.1 CLI Terminal UI/UX
*   **Progress Spinners:** A custom-styled `ora` spinner (rendered in a bright, modern teal theme) updates the user on scanning progress.
*   **Teal Palette Theme:** Uses custom-drawn Unicode panels and styled terminal cells. The theme utilizes:
    *   *Bright Teal (`#4ee6d3`):* Main headers and success indicators.
    *   *Standard Teal (`#2dbfad`):* Spinners, borders, and main accents.
    *   *Deep Teal (`#1d8a7c`):* Warnings and secondary accents.
    *   *Ember (`#C44536`):* Errors and critical highlights.
*   **Streaming Tree Logger (`AgentLogger`):** Displays tool calls in a structured timeline:
    ```bash
    turn 1/25
    ├── list_files               **/*                     Found 12 paths · 1.2 KB
    └── read_file                src/index.ts             250 lines · 9.7 KB
    ```
    Verbose mode renders output previews and exact millisecond latencies for each step.

### 6.2 Interactive HTML Dashboard
The HTML output (`audit-report.html`) is a premium single-file application designed with maximum interactivity:
*   **Visual Highlights:**
    *   *Monochrome Dark Mode:* Built with a sleek dark background (`#0a0a0a`) and elevated card surfaces (`#111111`/`#171717`) to highlight finding severities.
    *   *Vibrant Severity Badges:* High-contrast badges highlight issues (Red for Critical, Orange for High, Yellow for Medium, Blue for Low, Green for Success).
    *   *Typography:* Powered by `Inter` for interface elements and `Fira Code` for code sections.
*   **Interactive Features:**
    *   *SVG Score Ring:* An interactive SVG gauge animates to the target score percentage, alongside an active counter counting up values on load.
    *   *Responsive Category Tabs:* Displays category grades and issue counts, adapting to a single-column layout on mobile devices.
    *   *Keyword Search & Filter Bar:* Allows users to search findings, files, and proposed fixes in real-time, combined with severity-filter buttons.
    *   *Code Snippet Viewport:* Renders code context blocks in clean panels with line numbers.
    *   *One-Click Copy:* An interactive "Copy Fix" button copies the code snippet/fix and changes state to "Copied!".
    *   *Agent Trace Timeline:* An expandable timeline detailing agent turns with successful/failed call indicator dots, raw JSON input arguments, and output responses.
    *   *Zero Network Requests:* Self-contained CSS, fonts, SVG icons, and base64-encoded logo allow the dashboard to run completely offline.

---

## 7. How it Works (Under the Hood)

```
[CLI Command: ghostch . ]
       │
       ▼
[Scanner maps workspace] ───► Excludes node_modules/dist/.git
       │
       ▼
[Static Analyzers run] ───► Secrets, deps, and file complexity checked
       │
       ▼
[Is Agentic API Key set?]
       ├─── No  ───► Returns Static Findings Only
       │
       └─── Yes ───► Init Agentic Loop
                       │
                       ├─► Turn 1: Call get_project_summary & get_static_findings
                       ├─► Turn 2: Call list_files & read_dependency_manifest
                       ├─► Turn 3+: Call search_code & read_file to inspect code
                       ├─► Loop checks: Budget check, turns check, repetition check
                       │
                       ▼
                 [Agent calls finalize_audit]
                       │
                       ▼
                 [Orchestrator aggregates reports]
                       │
                       ▼
                 [Generates Terminal / Markdown / HTML / JSON outputs]
```

---

## 8. Extending the Codebase

### Adding a New Static Rule:
1. Open the target static analyzer (e.g., [secrets.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/static/secrets.ts) or [complexity.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/static/complexity.ts)).
2. Add your rule pattern, severity level, description, and proposed fix.
3. If it's a new category, update `AuditCategory` inside [types.ts](file:///a:/claude-audit-main/claude-audit-main/src/core/types.ts).

### Adding a New Tool for the Agent:
1. Open [tools.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/tools.ts).
2. Define the tool's schemas in `buildToolDefinitions`.
3. Write the tool's execution handler matching the signature:
   ```typescript
   async function execMyNewTool(ctx: ToolContext, input: Record<string, unknown>): Promise<ToolExecutionResult>
   ```
4. Register the handler in `TOOL_EXECUTORS`.
5. Update `SYSTEM_PROMPT` in [agent-loop.ts](file:///a:/claude-audit-main/claude-audit-main/src/analyzers/ai/agent-loop.ts) so the agent knows when to use it.

