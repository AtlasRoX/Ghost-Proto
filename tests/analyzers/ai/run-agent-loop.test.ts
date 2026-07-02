/* eslint-disable @typescript-eslint/no-explicit-any */
// ─────────────────────────────────────────────
//  Integration tests for runAgentLoop.
// ─────────────────────────────────────────────

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// ── Mock global.fetch ───────────────────────────
type Scripted = any | Error;
const scriptedQueue: Scripted[] = [];
const streamCalls: Array<{ messages: any[]; system: any; tools: any[] }> = [];

function resetMock(): void {
  scriptedQueue.length = 0;
  streamCalls.length = 0;
}

function scriptResponse(msg: any): void {
  scriptedQueue.push(msg);
}

function scriptError(err: Error): void {
  scriptedQueue.push(err);
}

// Mock global.fetch
(global as any).fetch = jest.fn().mockImplementation((url: string, init: any) => {
  const body = JSON.parse(init.body || '{}');
  streamCalls.push({
    messages: body.messages,
    system: body.messages.filter((m: any) => m.role === 'system').map((m: any) => m.content).join('\n'),
    tools: body.tools,
  });

  const next = scriptedQueue.shift();
  if (next === undefined) {
    throw new Error('MockFetch: no scripted response for this call');
  }
  if (next instanceof Error) {
    return Promise.reject(next);
  }

  return Promise.resolve({
    ok: true,
    json: async () => next,
    text: async () => JSON.stringify(next),
    status: 200,
  } as Response);
});

// ── Import AFTER fetch mock ───────────────────────
import { runAgentLoop } from '../../../src/analyzers/ai/agent-loop';
import type { ToolContext, FinalAuditPayload } from '../../../src/analyzers/ai/tools';

// ── Helpers to build scripted messages ──────────
interface MessageOpts {
  toolUses?: Array<{ id?: string; name: string; input: Record<string, unknown> }>;
  text?: string;
  stopReason?: 'tool_use' | 'end_turn' | 'max_tokens';
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

function buildMessage(opts: MessageOpts): any {
  const tool_calls: any[] = [];
  for (const tu of opts.toolUses ?? []) {
    tool_calls.push({
      id: tu.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
      type: 'function',
      function: {
        name: tu.name,
        arguments: JSON.stringify(tu.input),
      },
    });
  }

  const message: any = {
    role: 'assistant',
    content: opts.text || null,
  };
  if (tool_calls.length > 0) {
    message.tool_calls = tool_calls;
  }

  let finish_reason: string = 'stop';
  if (opts.stopReason === 'tool_use') finish_reason = 'tool_calls';
  else if (opts.stopReason === 'end_turn') finish_reason = 'stop';
  else if (opts.stopReason === 'max_tokens') finish_reason = 'length';
  else if (opts.toolUses?.length) finish_reason = 'tool_calls';

  return {
    choices: [
      {
        message,
        finish_reason,
      },
    ],
    usage: {
      prompt_tokens: opts.usage?.input_tokens ?? 100,
      completion_tokens: opts.usage?.output_tokens ?? 50,
      total_tokens: (opts.usage?.input_tokens ?? 100) + (opts.usage?.output_tokens ?? 50),
      prompt_tokens_details: {
        cached_tokens: opts.usage?.cache_read_input_tokens ?? 0,
      },
    },
  };
}

function makeCtx(): { ctx: ToolContext; tmpDir: string } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghostproto-loop-'));
  fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export const x = 1;\n');
  const ctx: ToolContext = {
    projectRoot: tmpDir,
    projectInfo: {
      path: tmpDir,
      name: 'test-project',
      languages: { TypeScript: 1 },
      frameworks: [],
      totalFiles: 1,
      totalLines: 1,
      hasTests: false,
      hasDependencyFile: false,
      dependencies: {},
      testFrameworks: [],
    },
    staticFindings: [],
    onFinalize: () => { /* overwritten by the loop */ },
  };
  return { ctx, tmpDir };
}

function validFinalPayload(): FinalAuditPayload {
  return {
    security: {
      score: 80,
      summary: 'No critical issues found.',
      findings: [
        {
          title: 'Example',
          severity: 'low',
          description: 'An example low-severity finding.',
          category: 'security',
        },
      ],
    },
  };
}

// ── Tests ────────────────────────────────────────
describe('runAgentLoop', () => {
  beforeEach(() => resetMock());

  it('happy path: tool_use → tool_result → finalize_audit → completed', async () => {
    const { ctx, tmpDir } = makeCtx();

    // Turn 1: GhostProto calls list_files
    scriptResponse(buildMessage({
      toolUses: [{ name: 'list_files', input: { pattern: '**/*.ts' } }],
      usage: { input_tokens: 200, output_tokens: 50, cache_read_input_tokens: 3000 },
    }));
    // Turn 2: GhostProto calls finalize_audit
    scriptResponse(buildMessage({
      toolUses: [{ name: 'finalize_audit', input: validFinalPayload() as any }],
      usage: { input_tokens: 300, output_tokens: 80 },
    }));

    const turnStarts: number[] = [];
    const toolCalls: string[] = [];
    let finished = false;

    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 10, maxBudgetTokens: 500_000 },
      {
        onTurnStart: ({ turn }) => turnStarts.push(turn),
        onToolCall: (r) => toolCalls.push(r.name),
        onFinish: () => { finished = true; },
      },
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('completed');
    expect(result.trace.summary.turns).toBe(2);
    expect(turnStarts).toEqual([1, 2]);
    expect(toolCalls).toEqual(['list_files', 'finalize_audit']);
    expect(finished).toBe(true);
    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.categories[0].category).toBe('security');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('stops with max_turns when GhostProto never calls finalize_audit', async () => {
    const { ctx, tmpDir } = makeCtx();

    // Script 3 turns that each call list_files with different args
    for (let i = 0; i < 3; i++) {
      scriptResponse(buildMessage({
        toolUses: [{ name: 'list_files', input: { pattern: `**/*.${i}.ts` } }],
        usage: { input_tokens: 50, output_tokens: 20 },
      }));
    }

    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 3, maxBudgetTokens: 500_000 },
      {},
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('max_turns');
    expect(result.trace.summary.turns).toBe(3);
    expect(result.trace.summary.stopDetail).toMatch(/Hit hard ceiling of 3 turns/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('stops with max_budget when cumulative tokens exceed the ceiling', async () => {
    const { ctx, tmpDir } = makeCtx();

    // One turn that burns more than the budget
    scriptResponse(buildMessage({
      toolUses: [{ name: 'list_files', input: { pattern: '**/*' } }],
      usage: { input_tokens: 600, output_tokens: 500 },
    }));

    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 10, maxBudgetTokens: 1_000 },
      {},
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('max_budget');
    expect(result.trace.summary.stopDetail).toMatch(/Token budget exceeded/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('trips the repetition circuit breaker when GhostProto spams the same call', async () => {
    const { ctx, tmpDir } = makeCtx();

    // Three turns, each calling search_code with IDENTICAL args
    for (let i = 0; i < 3; i++) {
      scriptResponse(buildMessage({
        toolUses: [{ name: 'search_code', input: { pattern: 'TODO' } }],
        usage: { input_tokens: 50, output_tokens: 20 },
      }));
    }

    const toolCalls: Array<{ name: string; isError: boolean }> = [];
    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 10, maxBudgetTokens: 500_000 },
      { onToolCall: (r) => toolCalls.push({ name: r.name, isError: r.isError }) },
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('repetition');
    expect(toolCalls[toolCalls.length - 1]).toEqual({ name: 'search_code', isError: true });

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('captures API errors as stopReason=error without crashing', async () => {
    const { ctx, tmpDir } = makeCtx();

    // Script errors for all fallback models (0.3, 0.2, 0.1)
    scriptError(new Error('429 rate_limit_error'));
    scriptError(new Error('429 rate_limit_error'));
    scriptError(new Error('429 rate_limit_error'));

    const progressMsgs: string[] = [];
    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 5, maxBudgetTokens: 500_000 },
      { onProgress: (m) => progressMsgs.push(m) },
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('error');
    expect(result.trace.summary.stopDetail).toMatch(/rate_limit_error/);
    expect(progressMsgs.some(m => m.includes('⚠ GhostProto API error'))).toBe(true);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('appends a budget-aware nudge to the user turn after 70% usage', async () => {
    const { ctx, tmpDir } = makeCtx();

    // Turn 1: burn enough tokens to cross the 70% token threshold
    scriptResponse(buildMessage({
      toolUses: [{ name: 'list_files', input: { pattern: '**/*' } }],
      usage: { input_tokens: 800, output_tokens: 0 },
    }));
    // Turn 2: finalize
    scriptResponse(buildMessage({
      toolUses: [{ name: 'finalize_audit', input: validFinalPayload() as any }],
      usage: { input_tokens: 50, output_tokens: 50 },
    }));

    await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 10, maxBudgetTokens: 1_000 },
      {},
      'Audit this project.',
    );

    const secondCall = streamCalls[1];
    const lastUserMsg = [...secondCall.messages].reverse().find(m => m.role === 'user');
    expect(lastUserMsg).toBeDefined();
    const hasBudgetText = typeof lastUserMsg.content === 'string'
      && /\[budget\]/.test(lastUserMsg.content);
    expect(hasBudgetText).toBe(true);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('marks stopReason=error when GhostProto ends the turn without calling finalize_audit', async () => {
    const { ctx, tmpDir } = makeCtx();

    scriptResponse(buildMessage({
      text: 'All done.',
      stopReason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 20 },
    }));

    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 5, maxBudgetTokens: 500_000 },
      {},
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('error');
    expect(result.trace.summary.stopDetail).toMatch(/finalize_audit/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('marks stopReason=error when GhostProto hits max_tokens mid-turn', async () => {
    const { ctx, tmpDir } = makeCtx();

    scriptResponse(buildMessage({
      toolUses: [{ name: 'list_files', input: { pattern: '**/*' } }],
      stopReason: 'max_tokens',
      usage: { input_tokens: 100, output_tokens: 16000 },
    }));

    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 5, maxBudgetTokens: 500_000 },
      {},
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('error');
    expect(result.trace.summary.stopDetail).toMatch(/max_tokens/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reports an error when an unknown tool is invoked by GhostProto', async () => {
    const { ctx, tmpDir } = makeCtx();

    scriptResponse(buildMessage({
      toolUses: [{ name: 'not_a_real_tool' as any, input: {} }],
      usage: { input_tokens: 50, output_tokens: 20 },
    }));
    scriptResponse(buildMessage({
      toolUses: [{ name: 'finalize_audit', input: validFinalPayload() as any }],
      usage: { input_tokens: 50, output_tokens: 20 },
    }));

    const toolCalls: Array<{ name: string; isError: boolean }> = [];
    const result = await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 5, maxBudgetTokens: 500_000 },
      { onToolCall: (r) => toolCalls.push({ name: r.name, isError: r.isError }) },
      'Audit this project.',
    );

    expect(result.trace.summary.stopReason).toBe('completed');
    expect(toolCalls[0]).toEqual({ name: 'not_a_real_tool', isError: true });

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('propagates turn-start / turn-end / api-response hooks with correct counts', async () => {
    const { ctx, tmpDir } = makeCtx();

    scriptResponse(buildMessage({
      toolUses: [
        { name: 'list_files',    input: { pattern: '**/*.ts' } },
        { name: 'get_project_summary', input: {} },
      ],
      usage: { input_tokens: 100, output_tokens: 30, cache_read_input_tokens: 2000 },
    }));
    scriptResponse(buildMessage({
      toolUses: [{ name: 'finalize_audit', input: validFinalPayload() as any }],
      usage: { input_tokens: 200, output_tokens: 40 },
    }));

    const apiResponses: number[] = [];
    const turnEnds: Array<{ turn: number; toolCalls: number }> = [];

    await runAgentLoop(
      ctx,
      { apiKey: 'test', model: '0.3', maxTurns: 10, maxBudgetTokens: 500_000 },
      {
        onApiResponse: ({ toolCalls }) => apiResponses.push(toolCalls),
        onTurnEnd: ({ turn, toolCalls }) => turnEnds.push({ turn, toolCalls }),
      },
      'Audit this project.',
    );

    expect(apiResponses).toEqual([2, 1]);
    expect(turnEnds).toEqual([
      { turn: 1, toolCalls: 2 },
      { turn: 2, toolCalls: 1 },
    ]);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
