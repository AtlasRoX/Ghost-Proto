"use strict";
// ─────────────────────────────────────────────
//  claude-audit — Agent Tools (read-only, sandboxed)
// ─────────────────────────────────────────────
//
// Narrow, purpose-built tools Claude can call during an agentic audit.
// Every tool is:
//   • Read-only (no mutation of user's filesystem)
//   • Path-sandboxed to the project root (no traversal, no absolute escape)
//   • Size-capped (refuses to dump gigantic files)
//   • Error-as-result (never throws; returns { isError, content })
//
// The safety is architectural: the executor literally has no code path that
// writes, spawns shells, or performs network I/O. An allowlist policy is
// not relied upon — capabilities are just not wired in.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_EXECUTORS = void 0;
exports.safeResolve = safeResolve;
exports.buildToolDefinitions = buildToolDefinitions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
// ── Configuration ────────────────────────────────
const MAX_RESULT_BYTES = 16 * 1024; // 16 KB per tool result (keeps ctx lean)
const MAX_FILE_READ_BYTES = 200 * 1024; // 200 KB per read_file invocation
const MAX_SEARCH_MATCHES = 100; // prevent noisy result blobs
const MAX_LIST_FILES = 500; // list_files output cap
// ── Path sandboxing ──────────────────────────────
/**
 * Resolve a user-supplied path against the project root and reject anything
 * that would escape the root. Returns the absolute resolved path or null.
 */
function safeResolve(projectRoot, userPath) {
    if (typeof userPath !== 'string' || userPath.length === 0)
        return null;
    // Reject null bytes — classic path-smuggling trick
    if (userPath.includes('\0'))
        return null;
    const root = path_1.default.resolve(projectRoot);
    const candidate = path_1.default.isAbsolute(userPath)
        ? path_1.default.resolve(userPath)
        : path_1.default.resolve(root, userPath);
    const rel = path_1.default.relative(root, candidate);
    if (rel.startsWith('..') || path_1.default.isAbsolute(rel))
        return null;
    return candidate;
}
// ── Result helpers ───────────────────────────────
function ok(content) {
    const bytes = Buffer.byteLength(content, 'utf-8');
    const truncated = bytes > MAX_RESULT_BYTES
        ? content.slice(0, MAX_RESULT_BYTES) +
            `\n\n[... truncated: result was ${bytes} bytes; please narrow your query]`
        : content;
    return { isError: false, content: truncated, bytes };
}
function err(message) {
    return { isError: true, content: `Error: ${message}`, bytes: Buffer.byteLength(message, 'utf-8') };
}
// ── Tool: list_files ─────────────────────────────
async function execListFiles(ctx, input) {
    const pattern = typeof input['pattern'] === 'string' ? input['pattern'] : '**/*';
    const maxResults = typeof input['max_results'] === 'number'
        ? Math.min(input['max_results'], MAX_LIST_FILES)
        : 100;
    try {
        const matches = await (0, fast_glob_1.default)(pattern, {
            cwd: ctx.projectRoot,
            onlyFiles: true,
            dot: false,
            followSymbolicLinks: false,
            ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**',
                '**/.next/**', '**/coverage/**', '**/__pycache__/**', '**/.venv/**'],
        });
        const sliced = matches.slice(0, maxResults);
        const rows = sliced.map(rel => {
            try {
                const stat = fs_1.default.statSync(path_1.default.join(ctx.projectRoot, rel));
                return `${rel}\t${stat.size}B`;
            }
            catch {
                return rel;
            }
        });
        const header = `Found ${matches.length} file(s)${matches.length > maxResults ? ` (showing ${maxResults})` : ''}:\n`;
        return ok(header + rows.join('\n'));
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
}
// ── Tool: read_file ──────────────────────────────
async function execReadFile(ctx, input) {
    const rawPath = input['path'];
    const startLine = typeof input['start_line'] === 'number' ? input['start_line'] : undefined;
    const endLine = typeof input['end_line'] === 'number' ? input['end_line'] : undefined;
    if (typeof rawPath !== 'string')
        return err('"path" is required (string).');
    const abs = safeResolve(ctx.projectRoot, rawPath);
    if (!abs)
        return err(`Path outside project root or invalid: ${rawPath}`);
    try {
        const stat = fs_1.default.statSync(abs);
        if (!stat.isFile())
            return err(`Not a file: ${rawPath}`);
        if (stat.size > MAX_FILE_READ_BYTES) {
            return err(`File is ${stat.size} bytes (limit ${MAX_FILE_READ_BYTES}). ` +
                `Use start_line/end_line to read a slice.`);
        }
        const content = fs_1.default.readFileSync(abs, 'utf-8');
        const lines = content.split('\n');
        const total = lines.length;
        const from = startLine && startLine > 0 ? startLine - 1 : 0;
        const to = endLine && endLine > 0 ? Math.min(endLine, total) : total;
        const slice = lines.slice(from, to);
        const numbered = slice
            .map((line, i) => `${String(from + i + 1).padStart(5)}| ${line}`)
            .join('\n');
        const header = `File: ${rawPath} (${total} lines${startLine || endLine ? `, showing ${from + 1}-${to}` : ''})\n`;
        return ok(header + numbered);
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
}
// ── Tool: search_code ────────────────────────────
async function execSearchCode(ctx, input) {
    const rawPattern = input['pattern'];
    const caseSensitive = Boolean(input['case_sensitive']);
    const isRegex = Boolean(input['regex']);
    const filePattern = typeof input['file_pattern'] === 'string' ? input['file_pattern'] : undefined;
    const maxMatches = typeof input['max_matches'] === 'number'
        ? Math.min(input['max_matches'], MAX_SEARCH_MATCHES)
        : 50;
    if (typeof rawPattern !== 'string' || rawPattern.length === 0) {
        return err('"pattern" is required (non-empty string).');
    }
    let regex;
    try {
        const source = isRegex ? rawPattern : rawPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(source, caseSensitive ? 'g' : 'gi');
    }
    catch (e) {
        return err(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
    }
    try {
        const files = await (0, fast_glob_1.default)(filePattern ?? '**/*', {
            cwd: ctx.projectRoot,
            onlyFiles: true,
            dot: false,
            followSymbolicLinks: false,
            ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**',
                '**/.next/**', '**/coverage/**', '**/*.min.js', '**/*.lock',
                '**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml'],
        });
        const matches = [];
        for (const rel of files) {
            if (matches.length >= maxMatches)
                break;
            const abs = path_1.default.join(ctx.projectRoot, rel);
            let stat;
            try {
                stat = fs_1.default.statSync(abs);
            }
            catch {
                continue;
            }
            if (!stat.isFile() || stat.size > MAX_FILE_READ_BYTES)
                continue;
            let content;
            try {
                content = fs_1.default.readFileSync(abs, 'utf-8');
            }
            catch {
                continue;
            }
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (matches.length >= maxMatches)
                    break;
                regex.lastIndex = 0;
                if (regex.test(lines[i])) {
                    matches.push({
                        file: rel,
                        line: i + 1,
                        text: lines[i].trim().slice(0, 200),
                    });
                }
            }
        }
        if (matches.length === 0) {
            return ok(`No matches for ${JSON.stringify(rawPattern)}${filePattern ? ` in ${filePattern}` : ''}.`);
        }
        const header = `Found ${matches.length}${matches.length >= maxMatches ? '+' : ''} match(es) for ${JSON.stringify(rawPattern)}:\n`;
        const rows = matches.map(m => `${m.file}:${m.line}: ${m.text}`).join('\n');
        return ok(header + rows);
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
}
// ── Tool: read_dependency_manifest ───────────────
async function execReadDependencyManifest(ctx) {
    const info = ctx.projectInfo;
    if (!info.hasDependencyFile || !info.dependencyFile) {
        return ok('No dependency manifest detected for this project.');
    }
    const abs = path_1.default.join(ctx.projectRoot, info.dependencyFile);
    try {
        const stat = fs_1.default.statSync(abs);
        if (stat.size > MAX_FILE_READ_BYTES) {
            const depCount = Object.keys(info.dependencies).length;
            const summary = `Manifest: ${info.dependencyFile} (too large to include raw; ${depCount} dependencies parsed)\n` +
                `Dependencies (first 50):\n` +
                Object.entries(info.dependencies).slice(0, 50).map(([k, v]) => `  ${k}@${v}`).join('\n');
            return ok(summary);
        }
        const raw = fs_1.default.readFileSync(abs, 'utf-8');
        return ok(`Manifest: ${info.dependencyFile}\n${raw}`);
    }
    catch (e) {
        return err(e instanceof Error ? e.message : String(e));
    }
}
// ── Tool: get_project_summary ────────────────────
function execGetProjectSummary(ctx) {
    const info = ctx.projectInfo;
    const lines = [
        `Project: ${info.name}`,
        `Languages: ${Object.entries(info.languages).map(([l, c]) => `${l} (${c})`).join(', ')}`,
        `Frameworks: ${info.frameworks.join(', ') || 'none detected'}`,
        `Total files (scanned): ${info.totalFiles}`,
        `Total lines: ${info.totalLines}`,
        `Has tests: ${info.hasTests}`,
        `Test frameworks: ${info.testFrameworks.join(', ') || 'none'}`,
        `Package manager: ${info.packageManager ?? 'unknown'}`,
        `Dependency count: ${Object.keys(info.dependencies).length}`,
    ];
    return ok(lines.join('\n'));
}
// ── Tool: get_static_findings ────────────────────
function execGetStaticFindings(ctx) {
    var _a;
    if (ctx.staticFindings.length === 0) {
        return ok('No static-analysis findings. Focus your deep dive on logic, architecture, and design.');
    }
    const byCategory = {};
    for (const f of ctx.staticFindings) {
        (byCategory[_a = f.category] ?? (byCategory[_a] = [])).push(f);
    }
    const lines = [
        `Static analyzers produced ${ctx.staticFindings.length} finding(s). Build on these; do not duplicate.`,
        '',
    ];
    for (const [cat, list] of Object.entries(byCategory)) {
        lines.push(`[${cat}] ${list.length} finding(s):`);
        for (const f of list.slice(0, 15)) {
            const loc = f.file ? ` @ ${f.file}${f.line ? ':' + f.line : ''}` : '';
            lines.push(`  - [${f.severity}] ${f.title}${loc}`);
        }
        if (list.length > 15)
            lines.push(`  ... and ${list.length - 15} more`);
        lines.push('');
    }
    return ok(lines.join('\n'));
}
// ── Tool: finalize_audit ─────────────────────────
function execFinalizeAudit(ctx, input) {
    try {
        const payload = input;
        ctx.onFinalize(payload);
        return ok('Audit finalized. Thank you.');
    }
    catch (e) {
        return err(`Failed to accept final audit: ${e instanceof Error ? e.message : String(e)}`);
    }
}
exports.TOOL_EXECUTORS = {
    list_files: execListFiles,
    read_file: execReadFile,
    search_code: execSearchCode,
    read_dependency_manifest: (ctx) => execReadDependencyManifest(ctx),
    get_project_summary: (ctx) => execGetProjectSummary(ctx),
    get_static_findings: (ctx) => execGetStaticFindings(ctx),
    finalize_audit: execFinalizeAudit,
};
/**
 * Tool definitions sent to the Claude API. Shape matches `Anthropic.Tool`.
 * We intentionally keep descriptions concrete and call out what NOT to use
 * the tool for — Claude reads descriptions and calibrates accordingly.
 */
function buildToolDefinitions() {
    const findingSchema = {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Unique finding id, e.g. "SEC-001"' },
            category: { type: 'string', enum: ['security', 'quality', 'performance', 'architecture', 'dependencies', 'testing', 'documentation'] },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
            title: { type: 'string', description: 'Concise title (<80 chars)' },
            description: { type: 'string', description: 'What the issue is AND why it matters.' },
            file: { type: 'string', description: 'Relative path from project root, if applicable' },
            line: { type: 'number', description: 'Line number in file, if applicable' },
            snippet: { type: 'string', description: 'Relevant code snippet (<200 chars)' },
            fix: { type: 'string', description: 'Concrete, actionable fix (preferably with a code example)' },
        },
        required: ['severity', 'title', 'description'],
    };
    const categoryPayload = {
        type: 'object',
        properties: {
            score: { type: 'integer', minimum: 0, maximum: 100, description: '0 worst, 100 best' },
            summary: { type: 'string', description: '2-3 sentence executive summary' },
            findings: { type: 'array', items: findingSchema, maxItems: 10 },
        },
        required: ['score', 'summary', 'findings'],
    };
    return [
        {
            name: 'list_files',
            description: 'List files in the project matching a glob. Use this to discover structure, ' +
                'find entry points, or locate specific file types (e.g. "src/**/*.ts"). ' +
                'Respects .gitignore-style defaults (node_modules, .git, dist, etc. are excluded). ' +
                'Do NOT use to read file contents — use read_file. Do NOT use for substring search — use search_code.',
            input_schema: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'Fast-glob pattern, e.g. "**/*.ts", "src/auth/**"' },
                    max_results: { type: 'integer', description: `Max paths to return (default 100, hard cap ${MAX_LIST_FILES})` },
                },
            },
        },
        {
            name: 'read_file',
            description: 'Read a file from the project, optionally a line range. Returns numbered lines. ' +
                'Use start_line/end_line when the file is large or you only need one region. ' +
                'Path must be inside the project root. Refuses files > 200 KB — use a range instead.',
            input_schema: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Relative path from project root (or absolute path inside root)' },
                    start_line: { type: 'integer', description: '1-based inclusive. Omit to start from line 1.' },
                    end_line: { type: 'integer', description: '1-based inclusive. Omit to read to EOF.' },
                },
                required: ['path'],
            },
        },
        {
            name: 'search_code',
            description: 'Search the codebase for a literal string or regex. Returns file:line:snippet matches. ' +
                'This is your primary discovery tool — use it liberally (eval, dangerouslySetInnerHTML, ' +
                'os.system, raw SQL, TODO/FIXME/HACK, suspicious patterns, etc.). ' +
                'Use file_pattern to scope. Do NOT use for exact filename lookup — use list_files.',
            input_schema: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'String or regex to search for' },
                    regex: { type: 'boolean', description: 'Treat pattern as regex (default false = literal)' },
                    case_sensitive: { type: 'boolean', description: 'Default false' },
                    file_pattern: { type: 'string', description: 'Limit search to files matching this glob' },
                    max_matches: { type: 'integer', description: `Default 50, hard cap ${MAX_SEARCH_MATCHES}` },
                },
                required: ['pattern'],
            },
        },
        {
            name: 'read_dependency_manifest',
            description: 'Read the project\'s dependency manifest (package.json, requirements.txt, go.mod, etc.). ' +
                'Use once at the start of the audit to understand third-party surface area.',
            input_schema: { type: 'object', properties: {} },
        },
        {
            name: 'get_project_summary',
            description: 'Get the pre-computed project profile (languages, frameworks, file/line counts, test setup, ' +
                'package manager). Call this first to orient yourself.',
            input_schema: { type: 'object', properties: {} },
        },
        {
            name: 'get_static_findings',
            description: 'Get deterministic findings already produced by built-in static analyzers (secrets, dependency ' +
                'CVEs, complexity). BUILD ON these — do not duplicate them in your final audit.',
            input_schema: { type: 'object', properties: {} },
        },
        {
            name: 'finalize_audit',
            description: 'Submit your final audit findings. Call this EXACTLY ONCE when you have investigated enough. ' +
                'Calling this ends the audit. Include every category you were asked to evaluate. ' +
                'Each finding must be REAL (you saw evidence via read_file/search_code), with file+line when applicable. ' +
                'Do NOT include findings already produced by static analyzers (you saw them via get_static_findings).',
            input_schema: {
                type: 'object',
                properties: {
                    security: categoryPayload,
                    quality: categoryPayload,
                    performance: categoryPayload,
                    architecture: categoryPayload,
                    testing: categoryPayload,
                    documentation: categoryPayload,
                    dependencies: categoryPayload,
                },
            },
        },
    ];
}
//# sourceMappingURL=tools.js.map