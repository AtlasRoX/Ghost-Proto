<div align="center">

# GhostProto

**AI-Powered Codebase Auditor**

*One command. Complete audit. Powered by Proto Engine.*


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org)
[![Powered by Proto Engine](https://img.shields.io/badge/Powered%20by-Proto%20Engine-green?style=flat-square)](https://github.com/AtlasRoX/Ghost-Proto)

</div>

---

## What is GhostProto?

**GhostProto** is a zero-config, AI-powered codebase auditor that runs like `npx ghostproto` (or `ghostch` globally) and gives you the kind of comprehensive audit report that would cost thousands from a consulting firm.

It combines **static analysis** (fast, no API key needed), **one-shot AI review**, and a true **agentic audit loop** where GhostProto actively investigates your codebase — reading files, searching for patterns, and verifying every finding with evidence — across 7 dimensions:

| Category | What It Checks |
|----------|---------------|
| 🔒 **Security** | Hardcoded secrets, SQL injection, XSS, vulnerable auth patterns, OWASP Top 10 |
| 📊 **Code Quality** | Complexity, duplication, naming, dead code, anti-patterns |
| ⚡ **Performance** | N+1 queries, memory leaks, inefficient algorithms, blocking I/O |
| 🏗️ **Architecture** | Modularity, separation of concerns, coupling, scalability |
| 📦 **Dependencies** | Known CVEs, deprecated packages, bloat, supply chain risks |
| 🧪 **Testing** | Coverage gaps, missing tests, test quality, flaky patterns |
| 📚 **Documentation** | Missing docs, stale comments, API documentation gaps |

---

## Quick Start

### Installation & Execution

#### 1. One-click Installer (Windows PowerShell)
You can install and setup `ghostch` globally with:
```powershell
iwr -useb https://raw.githubusercontent.com/AtlasRoX/Ghost-Proto/main/install.ps1 | iex
```
Then anywhere you just type `ghostch` to open the tool:
```bash
ghostch
```

#### 2. Run with npx (Zero Install)
```bash
# Set your Proto API key and run
GHOSTPROTO_API_KEY=nvapi-... npx ghostproto
```

#### 3. Command Usage Examples

```bash
# Static only — no API key required
ghostch --static

# Specific project path
ghostch ./path/to/project

# Save API key globally in ~/.ghostproto.json
ghostch key nvapi-xxxxxx

# One-shot AI mode — cheaper & faster, shallower than agentic
ghostch --fast

# Control the agent budget
ghostch --max-turns 40 --max-budget 1000000

# Output to HTML + Markdown reports
ghostch --output terminal,html,markdown

# CI/CD mode — JSON output, exits 1 on critical issues
ghostch --json
```

---

## Global Installation

```bash
# Global npm install
npm install -g ghostproto

# Then use anywhere
ghostch
ghostch ./my-project
```

---

## Example Output

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗ ██╗  ██╗ ██████╗  ██████╗████████╗    ██████╗ ██████╗  ██████╗     ║
║   ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██╔═══██╗    ║
║   ██║  ███╗███████║██║   ██║╚█████╗    ██║       ██████╔╝██████╔╝██║   ██║    ║
║   ██║   ██║██╔══██║██║   ██║ ╚═══██╗   ██║       ██╔═══╝ ██╔══██╗██║   ██║    ║
║   ╚██████╔╝██║  ██║╚██████╔╝██████╔╝   ██║       ██║     ██║  ██║╚██████╔╝    ║
║    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝       ╚═╝     ╚═╝  ╚═╝ ╚═════╝     ║
║                                                                              ║
║   AI Auditor powered by Proto Engine  ·  v0.2.2                              ║
║   github.com/AtlasRoX/Ghost-Proto                                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

╭─────────────────────────────── AUDIT REPORT ─────────────────────────────────╮
│  Project: my-saas-app                                                        │
│  Path:    /Users/dev/my-saas-app                                             │
│  Scanned: 247 files · 18,432 lines                                           │
│  Stack:   TypeScript, Python                                                 │
│  Frameworks: React, FastAPI, Prisma                                          │
│                                                                              │
│  ┌────────────────────────────────────┐                                     │
│  │   OVERALL SCORE: 64/100  Grade: C  │                                     │
│  └────────────────────────────────────┘                                     │
│                                                                              │
│  ✦ AI-Powered Analysis (Proto Engine)  ·  Duration: 12.4s                    │
╰──────────────────────────────────────────────────────────────────────────────╯

 CATEGORY SCORES

  🔒  Security        ██████░░░░░░░░░░░░░░  42/100  [ D ]  · 3 issues
  📊  Code Quality    ████████████░░░░░░░░  71/100  [ C ]  · 5 issues
  ⚡  Performance     █████████████░░░░░░░  78/100  [ C ]  · 2 issues
  🏗️   Architecture    ██████████░░░░░░░░░░  60/100  [ D ]  · 4 issues
  📦  Dependencies    ████████░░░░░░░░░░░░  55/100  [ F ]  · 7 issues
  🧪  Testing         ████████░░░░░░░░░░░░  40/100  [ F ]  · 2 issues
  📚  Documentation   ████████████░░░░░░░░  72/100  [ C ]  · 1 issue

 FINDINGS SUMMARY

  🔴 Critical: 2      🟠 High: 4      🟡 Medium: 8      🔵 Low: 10


  🚨   CRITICAL   CRITICAL ISSUES (2)
  ──────────────────────────────────────────────────────────────────────

    🔒 Hardcoded JWT Secret
    Potential Hardcoded JWT Secret found in source code.
    File: src/config/auth.ts:14
    Code: jwt_secret = "super-secret-key-dont-tell"
    Fix:  Use a randomly generated 256-bit secret stored in environment variables.

    📦 Vulnerable Dependency: axios
    axios@0.21.0 — SSRF vulnerability in versions < 0.21.2
    Fix:  Upgrade to axios@0.21.2 or later
```

---

## Features

### 🤖 Three Analysis Modes
| Mode | Flag | When to use |
|------|------|-------------|
| **Static** | `--static` | No API key, offline, CI pre-checks. Regex + AST rules. |
| **One-shot AI** | `--fast` | Cheap & fast Proto Engine review of a files digest. |
| **Agentic** *(default when API key is set)* | *(default)* | GhostProto actively investigates via tools — reads files, runs searches, verifies every finding with evidence. Deepest signal, highest accuracy. |

### 🧭 Agentic Audit — How it works
When an API key is available, GhostProto runs a **manual agentic loop**: the agent is given a read-only, sandboxed tool set and orchestrates its own investigation.

**Tools GhostProto has access to:**
- `get_project_summary` — languages, frameworks, test setup
- `get_static_findings` — deterministic findings to build on (never duplicate)
- `read_dependency_manifest` — `package.json`, `requirements.txt`, etc.
- `list_files` — glob-based discovery
- `search_code` — literal or regex search across the repo
- `read_file` — line-range reads with numbered output
- `finalize_audit` — structured submission of findings

**Production guardrails (all enabled by default):**
- 🛡️ **Path sandboxing** — every file access is resolved against the project root; traversal (`..`), absolute-path escape, and null-byte smuggling are rejected
- 🔒 **Read-only by construction** — no tool can write, spawn shells, or hit the network
- 🔁 **Repetition circuit breaker** — same tool call 3× in the last 6 calls aborts the loop before it wastes budget
- 🎯 **Iteration cap** — hard ceiling of 25 tool-use turns (configurable via `--max-turns`)
- 💰 **Token budget** — 500k-token hard ceiling per audit (configurable via `--max-budget`)
- ⏱️ **Per-turn streaming** — no SDK HTTP timeouts on long reasoning turns
- 🧯 **Errors as results** — tool failures are returned to the agent as recoverable results; the loop never crashes
- 📏 **Result size caps** — 16 KB per tool result, 200 KB per file read (agent is told to use ranges)
- ⏳ **Budget-aware nudges** — at 70% of the budget the agent is reminded to finalise instead of over-exploring
- 🧭 **Full audit trail** — every tool call is recorded to `.ghostproto/agent-trace.jsonl` (turn, input, output preview, duration, error flag). Disable with `--no-trace`.
- 📺 **Live streaming tree view** — the CLI prints each turn and tool call as it happens (no more opaque spinner); add `-V / --verbose` for per-turn token spend, tool durations, and result previews.

**Why an agentic audit beats a one-shot one:**
| | One-shot (`--fast`) | Agentic *(default)* |
|---|---|---|
| Evidence quality | Limited to file digest sent in the prompt | Agent reads actual files, line-by-line, and verifies each finding |
| Cross-file insight | Hard — small context window | Native — Agent pulls what it needs |
| False positives | Higher (inference from partial view) | Lower (must cite file:line + snippet) |
| Cost | Lower, bounded | Higher but **capped** via `--max-budget` |
| Latency | Single API call | Multiple turns (still ~1-3 min typical) |

### 📄 Multiple Output Formats
| Format | Flag | Description |
|--------|------|-------------|
| Terminal | `--output terminal` | Beautiful colored output (default) |
| Markdown | `--output markdown` | Saves `audit-report.md` under `.ghostproto/` |
| HTML | `--output html` | Beautiful standalone HTML report under `.ghostproto/` |
| JSON | `--output json` | Machine-readable, perfect for CI/CD |

### 🔧 Highly Configurable
```bash
# Static analysis only (no AI, no API key)
ghostch --static

# One-shot AI mode (no agentic loop, cheaper)
ghostch --fast

# Specific categories only
ghostch --categories security,dependencies

# Control scope
ghostch --max-files 1000 --max-file-size 200

# Tune the agent
ghostch --max-turns 40 --max-budget 1000000
ghostch --no-trace          # skip agent-trace.jsonl

# Use fallback Proto models
ghostch --model 0.2
ghostch --model 0.1
```

---

## Model Hierarchy

GhostProto supports the following models from Proto Engine:
1. **Primary (Default)**: `0.3` — Best for detailed reasoning and code investigation (under the hood uses `nvidia/nemotron-3-ultra-550b-a55b`).
2. **Secondary**: `0.2` — Balanced fallback model (under the hood uses `nvidia/nemotron-3-super-120b-a12b`).
3. **Tertiary**: `0.1` — Fastest fallback option (under the hood uses `nvidia/llama-3.3-nemotron-super-49b-v1`).

---

## ⚙️ CI/CD Integration

### GitHub Action
```yaml
- name: GhostProto Audit
  uses: AtlasRoX/Ghost-Proto@v0
  with:
    api-key: ${{ secrets.GHOSTPROTO_API_KEY }}  # optional
    fail-on-critical: true
```

The action outputs `score`, `grade`, `critical-count`, and `report-json` for downstream steps, and writes a summary table to your PR summary.

### Manual npx usage in CI
```yaml
- name: Run GhostProto
  run: npx ghostproto --json > audit.json
  env:
    GHOSTPROTO_API_KEY: ${{ secrets.GHOSTPROTO_API_KEY }}
```

### Pre-commit hook
```bash
#!/bin/sh
npx ghostproto --static --quiet --json | \
  node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.exit(r.criticalCount > 0 ? 1 : 0)"
```

---

## What Gets Audited

### 🔒 Security
- Hardcoded API keys, secrets, passwords, tokens
- AWS/GitHub/Proto/OpenAI credentials in source
- SQL injection patterns (string concatenation in queries)
- `eval()` usage, dangerous `innerHTML` patterns
- Disabled SSL/TLS verification
- Command injection via `subprocess(shell=True)`
- Insecure cryptographic functions (`Math.random()` for security)
- JWT secret exposure
- Database connection strings with credentials

### 📦 Dependencies
- Packages with known CVEs (lodash, axios, minimist, etc.)
- Deprecated/unmaintained packages (moment, request)
- Excessive dependency count
- Missing lock files

### 📊 Code Quality
- Files > 500 lines (consider splitting)
- Deep nesting (>5 levels)
- Excessive `console.log` usage
- Duplicate imports
- Missing documentation on large files
- Test coverage ratio

---

## How It Works

```
Your Codebase
     │
     ▼
┌─────────────────────────────────┐
│         File Scanner            │
│  • Respects .gitignore          │
│  • Detects languages/frameworks │
│  • Reads source files           │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│       Static Analyzers          │
│  • Secret detection (20+ rules) │
│  • Dependency vulnerability DB  │
│  • Complexity & quality checks  │
└─────────────────────────────────┘
     │
     ▼ (if GHOSTPROTO_API_KEY set — default path)
┌─────────────────────────────────────────────────┐
│       Proto Engine — Agentic Audit Loop         │
│                                                 │
│   ┌─────────────────────────────────────┐      │
│   │  Agent reasons → picks a tool call  │◄─┐   │
│   └─────────────────────────────────────┘  │   │
│                 │                           │   │
│                 ▼                           │   │
│   ┌─────────────────────────────────────┐  │   │
│   │  Sandboxed executor runs the tool   │  │   │
│   │  (list_files / search_code /        │  │   │
│   │   read_file / ...) — read-only      │  │   │
│   └─────────────────────────────────────┘  │   │
│                 │                           │   │
│                 └───────── tool_result ─────┘   │
│                                                 │
│   Guardrails:  max-turns · max-budget ·         │
│   repetition detector · path sandbox · trace    │
│   │                                             │
│   Terminates when Agent calls finalize_audit    │
└─────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│         Report Generator        │
│  • Terminal (colored)           │
│  • audit-report.md              │
│  • audit-report.html            │
│  • audit-report.json            │
│  • agent-trace.jsonl            │
└─────────────────────────────────┘
```

### Trace artifact
Every agentic audit produces `.ghostproto/agent-trace.jsonl` with one event per line:
```jsonl
{"kind":"meta","model":"0.3","maxTurns":25,"maxBudgetTokens":500000,"summary":{...}}
{"kind":"call","turn":1,"toolUseId":"call_...","name":"get_project_summary","input":{},"outputPreview":"...","outputBytes":342,"durationMs":2,"isError":false,"timestamp":"2026-04-23T..."}
{"kind":"call","turn":2,"toolUseId":"call_...","name":"search_code","input":{"pattern":"eval("},...}
```
Useful for debugging, cost analysis, and compliance/audit-trail requirements.

---

## Supported Languages & Ecosystems

TypeScript · JavaScript · Python · Go · Rust · Java · Kotlin · Swift ·  
C/C++ · C# · PHP · Ruby · Scala · Elixir · Haskell · Lua · R ·  
SQL · Shell · YAML · Terraform · Dockerfile · Vue · Svelte · Astro

---

## Options Reference

```
Usage: ghostch [options] [path]

Arguments:
  path                      Path to the project to audit (default: ".")

Options:
  -v, --version             Output version
  -k, --api-key <key>       Proto API key (or set GHOSTPROTO_API_KEY)
  -o, --output <formats>    Output formats: terminal,markdown,html,json (default: "terminal,markdown,html")
  -c, --categories <cats>   Audit specific categories only
  -m, --model <model>       Proto model (default: "0.3")
  --max-files <n>           Max files to scan (default: 500)
  --max-file-size <kb>      Max file size in KB (default: 100)
  --static                  Static analysis only (no AI)
  --fast                    One-shot AI mode (no agentic loop)
  --max-turns <n>           Agentic iteration cap (default: 25)
  --max-budget <tokens>     Agentic token ceiling (default: 500000)
  --no-trace                Don't write agent-trace.jsonl
  -V, --verbose             Show per-turn token spend, tool durations, and result previews
  --output-dir <dir>        Directory for report files (default: .ghostproto/)
  -q, --quiet               Suppress progress output
  --json                    Output JSON to stdout (CI/CD mode)
  -h, --help                Display help
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Audit passed — no critical issues |
| `1` | Critical security issues found |
| `2` | Audit failed (error) |

---

## Contributing

```bash
git clone https://github.com/AtlasRoX/Ghost-Proto.git
cd Ghost-Proto
npm install
npm run dev -- ./some-project   # test against a project
npm run build                   # compile TypeScript
```

Contributions welcome! Please open an issue first for major changes.

---

## License

MIT © [AtlasRoX](https://github.com/AtlasRoX)
