"use strict";
// ─────────────────────────────────────────────
//  ghostproto — Agentic Loop (manual, production-grade)
// ─────────────────────────────────────────────
//
// A deliberate, minimal agentic loop with production guardrails:
//   • Iteration cap (circuit breaker for stuck loops)
//   • Token budget (hard cost ceiling)
//   • Repetition detector (kills pathological same-call loops)
//   • Errors-as-results (tools never throw into the loop)
//   • Full audit trace (every tool call recorded)
//   • Progress events (UX while GhostProto is thinking/searching)
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInitialUserPrompt = buildInitialUserPrompt;
exports.detectRepetition = detectRepetition;
exports.hashToolCall = hashToolCall;
exports.runAgentLoop = runAgentLoop;
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("../../core/types");
const tools_1 = require("./tools");
// ── Tuning constants ─────────────────────────────
const REPETITION_WINDOW = 6; // look at last 6 tool calls
const REPETITION_THRESHOLD = 3; // same call 3x in window = stuck
const OUTPUT_PREVIEW_CHARS = 300; // what we store in the trace per call
// ── System prompt (stable → cacheable) ───────────
const SYSTEM_PROMPT = `You are GhostProto — an expert principal engineer conducting a thorough, evidence-based code audit.

Your job is to investigate the codebase using the provided tools, then submit a structured audit via \`finalize_audit\`.

## Method — follow this procedure

1. **Orient.** Call \`get_project_summary\` and \`get_static_findings\` first. Then call \`read_dependency_manifest\`.
2. **Map the surface.** Use \`list_files\` to understand structure. Identify entry points, auth, API routes, data access, config.
3. **Hunt.** Use \`search_code\` aggressively. Look for real risks:
   - Security: \`eval\`, \`exec\`, \`dangerouslySetInnerHTML\`, shell injection, unsanitised SQL, hardcoded secrets, disabled TLS, weak crypto (\`Math.random\` for tokens), unsafe deserialization.
   - Quality: god files (>500 lines), duplicated logic, magic numbers, swallowed errors (empty catch), dead code.
   - Performance: N+1 queries, sync I/O in hot paths, unbounded loops, unindexed lookups.
   - Architecture: circular deps, leaky abstractions, god objects, missing separation of concerns.
   - Testing: missing critical-path tests, flaky patterns (hardcoded ports, sleeps).
   - Documentation: missing READMEs for non-trivial modules, undocumented public APIs.
4. **Verify.** When you find a candidate issue via search, use \`read_file\` to confirm by reading the surrounding context. Never report a finding you have not verified in the actual source.
5. **Submit.** Call \`finalize_audit\` exactly once with your complete findings.

## Standards

- **Evidence required.** Every finding you submit must include \`file\` and \`line\` when applicable, plus a real \`snippet\`. If you could not verify it, do not submit it.
- **Do not duplicate static findings.** You will have seen them via \`get_static_findings\`. Build on them, don't repeat them.
- **Be specific, not generic.** "Add input validation" is weak. "Sanitize \`userInput\` at src/api/posts.ts:42 before passing to \`db.query\` — use parameterized queries" is strong.
- **Calibrate severity honestly.** \`critical\` = likely exploit/data loss in prod. \`high\` = meaningful risk. \`medium\` = quality/maintainability. \`low\` = nit/minor. \`info\` = observation.
- **Budget respect.** You have a bounded number of tool calls. Prioritise high-signal investigation over exhaustive exploration.
- **Output discipline.** When you have enough evidence, finalize. Do not pad with speculative findings.

Return no prose outside of tool calls. Use tool calls to act; use \`finalize_audit\` to conclude.`;
// ── Input → project context ──────────────────────
function buildInitialUserPrompt(info, files, filterCategories) {
    const cats = filterCategories ?? ['security', 'quality', 'performance', 'architecture', 'testing', 'documentation', 'dependencies'];
    const topFiles = files
        .slice(0, 20)
        .map(f => `  - ${f.relativePath} (${f.lines} lines)`)
        .join('\n');
    return `Audit this codebase across: ${cats.join(', ')}.

Project root: ${info.path}
Name: ${info.name}

A sample of scanned files (full project is accessible via tools):
${topFiles}

Begin your audit. Call tools to investigate, then submit via finalize_audit.`;
}
// ── Repetition detector ──────────────────────────
function detectRepetition(recent, nextHash) {
    const window = [...recent, nextHash].slice(-REPETITION_WINDOW);
    const counts = new Map();
    for (const h of window)
        counts.set(h, (counts.get(h) ?? 0) + 1);
    for (const c of counts.values()) {
        if (c >= REPETITION_THRESHOLD)
            return true;
    }
    return false;
}
function hashToolCall(name, input) {
    const canonical = JSON.stringify(input, Object.keys(input).sort());
    return crypto_1.default.createHash('sha1').update(name + '\0' + canonical).digest('hex').slice(0, 16);
}
// ── Main loop ────────────────────────────────────
async function runAgentLoop(ctx, opts, hooks = {}, initialUserPrompt) {
    const tools = (0, tools_1.buildToolDefinitions)();
    const openAiTools = tools.map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: t.input_schema,
        },
    }));
    const trace = [];
    let finalPayload = null;
    ctx.onFinalize = (p) => { finalPayload = p; };
    // Budget tracking
    let inputTokens = 0;
    let outputTokens = 0;
    let cacheReadTokens = 0;
    let cacheCreationTokens = 0;
    const recentHashes = [];
    let stopReason = 'error';
    let stopDetail;
    let actualModelUsed = opts.model;
    const start = Date.now();
    const messages = [
        { role: 'user', content: initialUserPrompt },
    ];
    let turn = 0;
    try {
        while (turn < opts.maxTurns) {
            turn++;
            const turnStartTime = Date.now();
            const preTurnInput = inputTokens;
            const preTurnOutput = outputTokens;
            const preTurnCacheRead = cacheReadTokens;
            const preTurnCacheCreation = cacheCreationTokens;
            hooks.onTurnStart?.({ turn, maxTurns: opts.maxTurns });
            hooks.onProgress?.(`GhostProto is reasoning (turn ${turn}/${opts.maxTurns}, ${inputTokens + outputTokens} tokens used)...`);
            const modelsToTry = [];
            if (opts.model === '0.3') {
                modelsToTry.push('nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b', 'nvidia/llama-3.3-nemotron-super-49b-v1');
            }
            else if (opts.model === '0.2') {
                modelsToTry.push('nvidia/nemotron-3-super-120b-a12b', 'nvidia/llama-3.3-nemotron-super-49b-v1');
            }
            else if (opts.model === '0.1') {
                modelsToTry.push('nvidia/llama-3.3-nemotron-super-49b-v1');
            }
            else {
                modelsToTry.push(opts.model, 'nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b', 'nvidia/llama-3.3-nemotron-super-49b-v1');
            }
            let chatCompletion;
            let lastError;
            for (const currentModel of modelsToTry) {
                try {
                    const modelLabel = currentModel.split('/').pop() || currentModel;
                    hooks.onProgress?.(`GhostProto is reasoning (turn ${turn}/${opts.maxTurns}, model: ${modelLabel})...`);
                    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${opts.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: currentModel,
                            messages: [
                                { role: 'system', content: SYSTEM_PROMPT },
                                ...messages,
                            ],
                            tools: openAiTools,
                            tool_choice: 'auto',
                            temperature: 0.2,
                            max_tokens: 4096,
                        }),
                    });
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(`HTTP status ${res.status}: ${errText}`);
                    }
                    chatCompletion = (await res.json());
                    actualModelUsed = currentModel;
                    lastError = undefined;
                    break; // Success!
                }
                catch (e) {
                    lastError = e instanceof Error ? e : new Error(String(e));
                    const modelLabel = currentModel.split('/').pop() || currentModel;
                    hooks.onProgress?.(`⚠ Model ${modelLabel} failed: ${lastError.message}. Trying next fallback...`);
                }
            }
            if (!chatCompletion || lastError) {
                stopReason = 'error';
                stopDetail = lastError?.message ?? 'All models failed';
                hooks.onProgress?.(`⚠ GhostProto API error on turn ${turn}: ${stopDetail}`);
                break;
            }
            // Update token counters
            const usage = chatCompletion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
            inputTokens += usage.prompt_tokens;
            outputTokens += usage.completion_tokens;
            const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;
            cacheReadTokens += cached;
            // Hard budget ceiling
            const totalTokens = inputTokens + outputTokens;
            if (totalTokens > opts.maxBudgetTokens) {
                stopReason = 'max_budget';
                stopDetail = `Token budget exceeded: ${totalTokens} > ${opts.maxBudgetTokens}`;
                const choice = chatCompletion.choices?.[0];
                if (choice && choice.message) {
                    messages.push({
                        role: 'assistant',
                        content: choice.message.content || null,
                        tool_calls: choice.message.tool_calls,
                    });
                }
                break;
            }
            const choice = chatCompletion.choices?.[0];
            if (!choice || !choice.message) {
                stopReason = 'error';
                stopDetail = 'Proto Engine API returned an empty completion response choice.';
                break;
            }
            const assistantMessage = choice.message;
            const toolCalls = assistantMessage.tool_calls || [];
            // End turn without tool use
            if (choice.finish_reason === 'stop' || toolCalls.length === 0) {
                messages.push({
                    role: 'assistant',
                    content: assistantMessage.content || null,
                });
                stopReason = finalPayload ? 'completed' : 'error';
                if (!finalPayload) {
                    stopDetail = 'GhostProto ended the turn without calling finalize_audit.';
                }
                break;
            }
            if (choice.finish_reason === 'length') {
                stopReason = 'error';
                stopDetail = 'Model hit max_tokens mid-turn. Increase max_tokens or reduce task scope.';
                messages.push({
                    role: 'assistant',
                    content: assistantMessage.content || null,
                    tool_calls: assistantMessage.tool_calls,
                });
                break;
            }
            messages.push({
                role: 'assistant',
                content: assistantMessage.content || null,
                tool_calls: assistantMessage.tool_calls,
            });
            hooks.onApiResponse?.({ turn, toolCalls: toolCalls.length });
            // Execute tool calls sequentially
            const toolResults = [];
            let trippedRepetition = false;
            for (let idx = 0; idx < toolCalls.length; idx++) {
                const call = toolCalls[idx];
                const meta = { indexInTurn: idx, totalInTurn: toolCalls.length };
                const name = call.function.name;
                let input;
                try {
                    input = JSON.parse(call.function.arguments || '{}');
                }
                catch {
                    input = {};
                }
                // Repetition detection
                const h = hashToolCall(name, input);
                if (detectRepetition(recentHashes, h)) {
                    trippedRepetition = true;
                    const msg = `Circuit breaker: same tool call repeated ${REPETITION_THRESHOLD} times in the last ${REPETITION_WINDOW} calls. Aborting to prevent wasted budget. Call finalize_audit with what you have.`;
                    toolResults.push({
                        role: 'tool',
                        tool_call_id: call.id,
                        name,
                        content: msg,
                    });
                    const record = {
                        turn,
                        toolUseId: call.id,
                        name,
                        input,
                        outputPreview: msg.slice(0, OUTPUT_PREVIEW_CHARS),
                        outputBytes: Buffer.byteLength(msg, 'utf-8'),
                        durationMs: 0,
                        isError: true,
                        timestamp: new Date().toISOString(),
                    };
                    trace.push(record);
                    hooks.onToolCall?.(record, meta);
                    continue;
                }
                recentHashes.push(h);
                hooks.onProgress?.(`→ ${name}${summarizeInput(name, input)}`);
                const tStart = Date.now();
                const executor = tools_1.TOOL_EXECUTORS[name];
                let result;
                if (!executor) {
                    result = {
                        isError: true,
                        content: `Unknown tool: ${name}. Available: ${Object.keys(tools_1.TOOL_EXECUTORS).join(', ')}`,
                        bytes: 0,
                    };
                }
                else {
                    try {
                        result = await executor(ctx, input);
                    }
                    catch (e) {
                        result = {
                            isError: true,
                            content: `Internal tool error: ${e instanceof Error ? e.message : String(e)}`,
                            bytes: 0,
                        };
                    }
                }
                const durationMs = Date.now() - tStart;
                toolResults.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    name,
                    content: result.content,
                });
                const record = {
                    turn,
                    toolUseId: call.id,
                    name,
                    input,
                    outputPreview: result.content.slice(0, OUTPUT_PREVIEW_CHARS),
                    outputBytes: result.bytes,
                    durationMs,
                    isError: result.isError,
                    timestamp: new Date().toISOString(),
                };
                trace.push(record);
                hooks.onToolCall?.(record, meta);
                if (name === 'finalize_audit' && finalPayload) {
                    break;
                }
            }
            // Emit turn-end with per-turn usage delta
            hooks.onTurnEnd?.({
                turn,
                turnInputTokens: inputTokens - preTurnInput,
                turnOutputTokens: outputTokens - preTurnOutput,
                turnCacheReadTokens: cacheReadTokens - preTurnCacheRead,
                turnCacheCreationTokens: cacheCreationTokens - preTurnCacheCreation,
                cumulativeInputTokens: inputTokens,
                cumulativeOutputTokens: outputTokens,
                cumulativeCacheReadTokens: cacheReadTokens,
                durationMs: Date.now() - turnStartTime,
                toolCalls: toolCalls.length,
            });
            // Budget-awareness nudge
            const turnProgress = turn / opts.maxTurns;
            const tokenProgress = (inputTokens + outputTokens) / opts.maxBudgetTokens;
            messages.push(...toolResults);
            if (turnProgress >= 0.7 || tokenProgress >= 0.7) {
                const remainingTurns = opts.maxTurns - turn;
                messages.push({
                    role: 'user',
                    content: `[budget] ${remainingTurns} turn(s) remaining out of ${opts.maxTurns}. Wrap up your investigation and call finalize_audit with what you have now.`,
                });
            }
            if (trippedRepetition) {
                stopReason = 'repetition';
                stopDetail = 'Repetition circuit breaker tripped.';
                break;
            }
            if (finalPayload) {
                stopReason = 'completed';
                break;
            }
        }
        if (turn >= opts.maxTurns && stopReason === 'error') {
            stopReason = 'max_turns';
            stopDetail = `Hit hard ceiling of ${opts.maxTurns} turns without finalize_audit.`;
        }
    }
    catch (e) {
        stopReason = 'error';
        stopDetail = e instanceof Error ? e.message : String(e);
    }
    const durationMs = Date.now() - start;
    const toolUsage = {};
    for (const r of trace)
        toolUsage[r.name] = (toolUsage[r.name] ?? 0) + 1;
    const summary = {
        turns: turn,
        toolCalls: trace.length,
        errors: trace.filter(r => r.isError).length,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheCreationTokens,
        stopReason,
        stopDetail,
        durationMs,
        toolUsage,
    };
    hooks.onFinish?.(summary);
    const agentTrace = {
        enabled: true,
        model: actualModelUsed,
        maxTurns: opts.maxTurns,
        maxBudgetTokens: opts.maxBudgetTokens,
        summary,
        calls: trace,
    };
    const categories = buildCategoriesFromFinal(finalPayload, opts.filterCategories);
    return { categories, trace: agentTrace };
}
// ── Finalization → CategoryScore[] ───────────────
function buildCategoriesFromFinal(payload, filter) {
    const allCategoryOrder = ['security', 'quality', 'performance', 'architecture', 'testing', 'documentation', 'dependencies'];
    const order = filter ?? allCategoryOrder;
    if (!payload) {
        return order.map(cat => ({
            category: cat,
            score: 50,
            grade: 'C',
            findings: [],
            summary: 'Agentic audit ended without a finalized submission.',
        }));
    }
    return order.map(cat => {
        const data = payload[cat];
        if (!data) {
            return {
                category: cat,
                score: 70,
                grade: (0, types_1.scoreToGrade)(70),
                findings: [],
                summary: 'No findings reported for this category.',
            };
        }
        const score = Math.max(0, Math.min(100, Math.round(data.score)));
        const findings = (data.findings ?? []).map((f, i) => ({
            id: f.id ?? `${cat.toUpperCase().slice(0, 3)}-AGENT-${i + 1}`,
            category: cat,
            severity: f.severity ?? 'medium',
            title: f.title ?? 'Untitled finding',
            description: f.description ?? '',
            file: f.file,
            line: f.line,
            snippet: f.snippet,
            fix: f.fix,
        }));
        return {
            category: cat,
            score,
            grade: (0, types_1.scoreToGrade)(score),
            findings,
            summary: data.summary ?? '',
        };
    });
}
// ── Progress helpers ─────────────────────────────
function summarizeInput(name, input) {
    switch (name) {
        case 'list_files': {
            const p = typeof input['pattern'] === 'string' ? input['pattern'] : '**/*';
            return `: ${p}`;
        }
        case 'read_file': {
            const p = typeof input['path'] === 'string' ? input['path'] : '?';
            const range = input['start_line'] || input['end_line']
                ? ` [${input['start_line'] ?? 1}:${input['end_line'] ?? '∞'}]`
                : '';
            return `: ${p}${range}`;
        }
        case 'search_code': {
            const p = typeof input['pattern'] === 'string' ? input['pattern'] : '?';
            const scope = typeof input['file_pattern'] === 'string' ? ` in ${input['file_pattern']}` : '';
            return `: ${JSON.stringify(p)}${scope}`;
        }
        case 'finalize_audit':
            return ' — submitting report';
        default:
            return '';
    }
}
//# sourceMappingURL=agent-loop.js.map