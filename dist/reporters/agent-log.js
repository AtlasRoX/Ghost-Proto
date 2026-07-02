"use strict";
// ─────────────────────────────────────────────
//  ghostproto — Agent Logger (streaming tree view)
// ─────────────────────────────────────────────
//
// Replaces the static "GhostProto is thinking..." spinner with a live, readable
// timeline of the agent's investigation. One tool call = one permanent line.
// A spinner only shows during the genuinely-blocking API-wait phase of each
// turn, then clears as soon as GhostProto emits tool uses.
//
// Designed to match the warm amber terminal theme used elsewhere in the CLI.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLogger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
// ── Theme (mirrors terminal.ts) ──────────────────
const AMBER = {
    primary: '#D97757',
    bright: '#E8A87C',
    deep: '#B85C38',
    glow: '#F4A261',
    cream: '#F4E5D3',
    tan: '#A67B5B',
    ember: '#C44536',
};
const c = {
    primary: chalk_1.default.hex(AMBER.bright).bold,
    accent: chalk_1.default.hex(AMBER.primary),
    accentBold: chalk_1.default.hex(AMBER.primary).bold,
    body: chalk_1.default.hex(AMBER.cream),
    muted: chalk_1.default.hex(AMBER.tan),
    tan: chalk_1.default.hex(AMBER.tan),
    deep: chalk_1.default.hex(AMBER.deep),
    glow: chalk_1.default.hex(AMBER.glow),
    ember: chalk_1.default.hex(AMBER.ember),
    success: chalk_1.default.hex(AMBER.bright).bold,
    error: chalk_1.default.hex(AMBER.ember).bold,
    warn: chalk_1.default.hex(AMBER.deep).bold,
};
// ── Formatting helpers ───────────────────────────
function formatBytes(n) {
    if (n < 1024)
        return `${n} B`;
    if (n < 1024 * 1024)
        return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function formatMs(n) {
    if (n < 1000)
        return `${n}ms`;
    if (n < 60000)
        return `${(n / 1000).toFixed(1)}s`;
    const m = Math.floor(n / 60000);
    const s = Math.round((n % 60000) / 1000);
    return `${m}m ${s.toString().padStart(2, '0')}s`;
}
function formatTokens(n) {
    if (n < 1000)
        return String(n);
    if (n < 1000000)
        return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
    return `${(n / 1000000).toFixed(2)}M`;
}
function truncate(s, max) {
    if (s.length <= max)
        return s;
    return s.slice(0, max - 1) + '…';
}
/** Extract a one-line outcome hint from a tool_result preview. */
function outcomeHint(name, preview, isError, bytes) {
    if (isError) {
        const firstLine = preview.split('\n')[0] ?? '';
        return c.ember(truncate(firstLine.replace(/^Error:\s*/, ''), 60));
    }
    // Parse tool-specific headers we control in tools.ts
    if (name === 'list_files') {
        const m = /Found\s+(\d+)\s+file/.exec(preview);
        if (m)
            return c.muted(`${m[1]} paths · ${formatBytes(bytes)}`);
    }
    if (name === 'search_code') {
        const m = /Found\s+(\d+)(\+?)\s+match/.exec(preview);
        if (m)
            return c.muted(`${m[1]}${m[2]} matches · ${formatBytes(bytes)}`);
        if (/No matches/.test(preview))
            return c.muted('0 matches');
    }
    if (name === 'read_file') {
        const m = /\((\d+)\s+lines?/.exec(preview);
        if (m)
            return c.muted(`${m[1]} lines · ${formatBytes(bytes)}`);
    }
    if (name === 'finalize_audit') {
        return c.success('submitting report');
    }
    return c.muted(formatBytes(bytes));
}
/** Render a terse argument summary for a tool call (always shown). */
function argSummary(name, input) {
    switch (name) {
        case 'list_files': {
            const p = typeof input['pattern'] === 'string' ? input['pattern'] : '**/*';
            return p;
        }
        case 'read_file': {
            const p = typeof input['path'] === 'string' ? input['path'] : '?';
            const s = input['start_line'];
            const e = input['end_line'];
            const range = (s || e) ? `:${s ?? 1}-${e ?? '∞'}` : '';
            return `${p}${range}`;
        }
        case 'search_code': {
            const p = typeof input['pattern'] === 'string' ? input['pattern'] : '?';
            const scope = typeof input['file_pattern'] === 'string' ? ` in ${input['file_pattern']}` : '';
            const regex = input['regex'] ? ' /rx/' : '';
            return `${JSON.stringify(p)}${regex}${scope}`;
        }
        default:
            return '';
    }
}
// ── The logger ───────────────────────────────────
class AgentLogger {
    constructor(opts = {}) {
        this.currentTurnStart = 0;
        this.startWallTime = 0;
        this.verbose = !!opts.verbose;
        this.out = opts.stream ?? process.stderr;
        this.useColor = !opts.noColor && this.out.isTTY === true;
        if (!this.useColor)
            chalk_1.default.level = 0;
    }
    write(line) {
        this.out.write(line + '\n');
    }
    rule() {
        const width = Math.min(this.out.columns ?? 80, 76);
        return c.tan('━'.repeat(width));
    }
    // ── Public API ─────────────────────────────────
    start(header) {
        this.startWallTime = Date.now();
        this.write('');
        this.write(this.rule());
        this.write(`  ${c.primary('✦ Agentic audit')}  ${c.tan('·')}  ${c.accent(header.model)}`);
        this.write(`  ${c.muted('budget')}  ${c.tan('·')}  ${c.body(String(header.maxTurns))} ${c.muted('turns')}  ${c.tan('/')}  ${c.body(header.maxBudgetTokens.toLocaleString())} ${c.muted('tokens')}` +
            (this.verbose ? `  ${c.tan('·')}  ${c.muted('verbose')}` : ''));
        this.write(this.rule());
        this.write('');
    }
    turnStart(info) {
        this.currentTurnStart = Date.now();
        const header = `  ${c.primary(`turn ${info.turn}`)}${c.muted(`/${info.maxTurns}`)}`;
        // Print the header as a permanent line, then spawn a spinner below it
        // so the tree output appears beneath.
        this.write(header);
        this.startSpinner(`${c.muted('reasoning…')}`);
    }
    /**
     * Called right after GhostProto's response arrives. Stops the spinner so the
     * tool call lines can stream in cleanly.
     */
    apiResponse(info) {
        this.stopSpinner();
        // No output line here — the turn header was already printed on turnStart.
        // Tool calls will follow immediately.
        void info;
    }
    toolCall(record, meta) {
        // In case the spinner is still alive (e.g. error path), kill it.
        this.stopSpinner();
        const isLast = meta.indexInTurn === meta.totalInTurn - 1;
        const connector = isLast ? '└─' : '├─';
        const branch = c.tan(connector);
        const name = record.isError
            ? c.ember(record.name.padEnd(26))
            : c.accent(record.name.padEnd(26));
        const args = argSummary(record.name, record.input);
        const argsCol = args ? c.body(truncate(args, 40)).padEnd(40 + (args ? 0 : 0)) : '';
        const hint = outcomeHint(record.name, record.outputPreview, record.isError, record.outputBytes);
        const duration = this.verbose ? c.muted(formatMs(record.durationMs).padStart(6)) : '';
        // Compose: "  ├─ name                args                     hint · 42ms"
        const line = [
            `  ${branch} ${name}`,
            argsCol ? `${argsCol}` : '',
            hint,
            duration,
        ]
            .filter(Boolean)
            .join('  ');
        this.write(line);
        // Verbose: show a preview of the tool result on a continuation line.
        if (this.verbose && record.outputPreview) {
            const pipe = isLast ? ' ' : c.tan('│');
            const preview = truncate(record.outputPreview.replace(/\s+/g, ' ').trim(), 100);
            this.write(`  ${pipe}   ${c.tan('↳')} ${c.muted(preview)}`);
        }
    }
    turnEnd(info) {
        this.stopSpinner();
        if (!this.verbose) {
            // Blank line between turns keeps the tree view breathable.
            this.write('');
            return;
        }
        // Verbose: per-turn summary with cache hit % and latency
        const totalIn = info.turnInputTokens + info.turnCacheReadTokens;
        const cachePct = totalIn > 0
            ? Math.round((info.turnCacheReadTokens / totalIn) * 100)
            : 0;
        this.write(`     ${c.muted('✦')}  ${c.muted(`${formatTokens(info.turnInputTokens)} in · ${formatTokens(info.turnOutputTokens)} out · ${cachePct}% cache · ${formatMs(info.durationMs)}`)}`);
        this.write('');
    }
    /** Called for soft events (errors, retries, warnings). */
    progress(msg) {
        // Ignore the generic "GhostProto is reasoning..." — the spinner already shows it.
        if (msg.startsWith('GhostProto is reasoning')) {
            if (this.spinner)
                this.spinner.text = c.muted('reasoning…');
            return;
        }
        // Ignore per-tool "→ name" chatter — tree view is authoritative.
        if (msg.startsWith('→ '))
            return;
        this.stopSpinner();
        if (msg.startsWith('⚠')) {
            this.write(`  ${c.warn(msg)}`);
        }
        else {
            this.write(`  ${c.muted(msg)}`);
        }
    }
    finish(summary) {
        this.stopSpinner();
        const elapsed = Date.now() - this.startWallTime;
        const marker = summary.stopReason === 'completed' ? c.success('✓ completed')
            : summary.stopReason === 'max_turns' ? c.warn('⚠ max turns reached')
                : summary.stopReason === 'max_budget' ? c.warn('⚠ token budget exceeded')
                    : summary.stopReason === 'repetition' ? c.warn('⚠ repetition detected')
                        : c.error('✗ error');
        const totalIn = summary.inputTokens + summary.cacheReadTokens;
        const cachePct = totalIn > 0
            ? Math.round((summary.cacheReadTokens / totalIn) * 100)
            : 0;
        this.write('');
        this.write(this.rule());
        this.write(`  ${marker}  ${c.tan('·')}  ${c.body(String(summary.turns))} turns  ${c.tan('·')}  ${c.body(String(summary.toolCalls))} tool calls` +
            (summary.errors > 0 ? `  ${c.tan('·')}  ${c.ember(String(summary.errors) + ' errors')}` : '') +
            `  ${c.tan('·')}  ${c.body(formatTokens(summary.inputTokens + summary.outputTokens))} tokens` +
            `  ${c.tan('·')}  ${c.muted(`${cachePct}% cache`)}` +
            `  ${c.tan('·')}  ${c.muted(formatMs(elapsed))}`);
        if (summary.stopDetail && summary.stopReason !== 'completed') {
            this.write(`  ${c.muted(summary.stopDetail)}`);
        }
        this.write(this.rule());
        this.write('');
    }
    // ── Spinner lifecycle (private) ────────────────
    startSpinner(text) {
        if (!this.useColor)
            return; // no TTY → no spinner (lines only)
        this.spinner = (0, ora_1.default)({
            text,
            spinner: 'dots',
            color: 'yellow',
            stream: this.out,
        }).start();
    }
    stopSpinner() {
        if (this.spinner) {
            // ora.stop() clears its own line and resets the cursor, which leaves the
            // "turn N/M" header intact above and lets subsequent writes appear in
            // the spinner's slot — exactly what we want for the tree layout.
            this.spinner.stop();
            this.spinner = undefined;
        }
    }
}
exports.AgentLogger = AgentLogger;
//# sourceMappingURL=agent-log.js.map