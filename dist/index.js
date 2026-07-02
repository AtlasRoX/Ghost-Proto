#!/usr/bin/env node
"use strict";
// ─────────────────────────────────────────────
//  ghostproto — CLI
// ─────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auditor_1 = require("./core/auditor");
const terminal_1 = require("./reporters/terminal");
const markdown_1 = require("./reporters/markdown");
const html_1 = require("./reporters/html");
const json_1 = require("./reporters/json");
const agent_log_1 = require("./reporters/agent-log");
const config_1 = require("./core/config");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: VERSION } = require('../package.json');
async function main() {
    const program = new commander_1.Command();
    program
        .name('ghostch')
        .description('AI-powered codebase auditor — security, quality, performance, architecture & more')
        .version(VERSION, '-v, --version');
    // Key configuration subcommand
    program
        .command('key <value>')
        .description('Set Proto API key in ~/.ghostproto.json')
        .action((value) => {
        try {
            (0, config_1.saveConfig)({ apiKey: value });
            console.log(chalk_1.default.green(`Successfully saved API key to ${(0, config_1.getConfigPath)()}`));
            process.exit(0);
        }
        catch (err) {
            console.error(chalk_1.default.red(`Error saving key: ${err.message}`));
            process.exit(1);
        }
    });
    // Main audit options
    program
        .argument('[path]', 'Path to the project to audit', '.')
        .option('-k, --api-key <key>', 'Proto API key (or set GHOSTPROTO_API_KEY env var)')
        .option('-o, --output <formats>', 'Output formats: terminal,markdown,html,json (comma-separated)', 'terminal,markdown,html')
        .option('-c, --categories <cats>', 'Audit only specific categories (security,quality,performance,architecture,dependencies,testing,documentation)')
        .option('-m, --model <model>', 'Proto model to use (0.3, 0.2, 0.1)', '0.3')
        .option('--max-files <n>', 'Maximum files to scan', '500')
        .option('--max-file-size <kb>', 'Maximum file size in KB to include', '100')
        .option('--static', 'Run static analysis only (no AI)')
        .option('--fast', 'Use one-shot AI mode (no agentic loop). Faster & cheaper but shallower.', false)
        .option('--max-turns <n>', 'Max tool-use iterations for agentic mode', '25')
        .option('--max-budget <tokens>', 'Hard ceiling on total tokens (input+output) per agentic audit', '500000')
        .option('--no-trace', 'Do not write agent-trace.jsonl (trace is on by default in agentic mode)')
        .option('-V, --verbose', 'Show per-turn token spend, tool durations, and result previews', false)
        .option('--output-dir <dir>', 'Directory for report files (default: .ghostproto/)')
        .option('-q, --quiet', 'Suppress progress output', false)
        .option('--json', 'Output JSON to stdout (for CI/CD)', false)
        .addHelpText('after', `
Examples:
  $ ghostch                              # agentic audit (default when API key set)
  $ ghostch ./my-project
  $ ghostch key nvapi-xxxxxx             # save API key globally
  $ ghostch --verbose                    # show per-turn tokens + tool previews
  $ ghostch --fast                       # one-shot mode (cheaper, shallower)
  $ ghostch --max-turns 40 --max-budget 1000000
  $ ghostch --static --output markdown   # no AI, static only
  $ ghostch --json > audit.json
  $ GHOSTPROTO_API_KEY=nvapi-... ghostch
    `);
    program.action(async (projectPathArg, opts) => {
        const projectPath = projectPathArg ?? '.';
        const outputFormats = (opts['output'] ?? 'terminal,markdown,html')
            .split(',')
            .map(f => f.trim());
        if (opts['json']) {
            outputFormats.length = 0;
            outputFormats.push('json');
        }
        const categories = opts['categories']
            ? opts['categories'].split(',').map(c => c.trim())
            : undefined;
        const resolvedApiKey = (0, config_1.getApiKey)(opts['apiKey']);
        // Agentic is the default when an API key is available and --fast wasn't set.
        const agentic = !opts['fast'] && !opts['static'] && !!resolvedApiKey;
        const options = {
            path: path_1.default.resolve(projectPath),
            apiKey: resolvedApiKey,
            output: outputFormats,
            categories,
            model: opts['model'] ?? '0.3',
            maxFiles: parseInt(opts['maxFiles']) || 500,
            maxFileSize: parseInt(opts['maxFileSize']) || 100,
            noAi: !!opts['static'],
            quiet: !!opts['quiet'],
            agentic,
            maxTurns: parseInt(opts['maxTurns']) || 25,
            maxBudgetTokens: parseInt(opts['maxBudget']) || 500000,
            // Commander sets `trace` to false when --no-trace is passed, true otherwise.
            trace: opts['trace'] !== false,
        };
        // Print banner (unless JSON mode or quiet)
        if (!opts['json'] && !options.quiet) {
            (0, terminal_1.printBanner)();
        }
        const liveMode = !opts['json'] && !options.quiet;
        // Pre-agent spinner: used during scan + static phases only.
        const spinner = (0, ora_1.default)({ text: 'Initializing...', color: 'yellow' });
        if (liveMode)
            spinner.start();
        // Streaming tree logger for agentic runs.
        const agentLogger = liveMode && options.agentic
            ? new agent_log_1.AgentLogger({ verbose: !!opts['verbose'] })
            : undefined;
        let spinnerHandedOff = false;
        const progressLog = (msg) => {
            if (!liveMode)
                return;
            // Once the agent loop has started, spinner has been retired and the
            // logger owns all progress rendering.
            if (spinnerHandedOff && agentLogger) {
                agentLogger.progress(msg);
                return;
            }
            // Hand-off point: the auditor emits this exact message right before it
            // calls into the agentic loop. We stop the spinner and light up the logger.
            if (agentLogger && msg.startsWith('Starting agentic audit')) {
                spinner.stop();
                agentLogger.start({
                    model: options.model,
                    maxTurns: options.maxTurns,
                    maxBudgetTokens: options.maxBudgetTokens,
                });
                spinnerHandedOff = true;
                return;
            }
            spinner.text = chalk_1.default.hex('#2dbfad')(msg);
        };
        let exitCode = 0;
        try {
            if (!fs_1.default.existsSync(options.path) || !fs_1.default.statSync(options.path).isDirectory()) {
                throw new Error(`Project directory does not exist or is not a directory: ${options.path}`);
            }
            const report = await (0, auditor_1.runAudit)(options, progressLog, {
                agent: agentLogger
                    ? {
                        onTurnStart: (info) => agentLogger.turnStart(info),
                        onApiResponse: (info) => agentLogger.apiResponse(info),
                        onToolCall: (record, meta) => agentLogger.toolCall(record, meta),
                        onTurnEnd: (info) => agentLogger.turnEnd(info),
                        onFinish: (summary) => agentLogger.finish(summary),
                    }
                    : undefined,
            });
            if (liveMode) {
                if (!spinnerHandedOff) {
                    spinner.succeed(chalk_1.default.hex('#2dbfad')(`Audit complete in ${report.durationMs < 1000 ? report.durationMs + 'ms' : (report.durationMs / 1000).toFixed(1) + 's'}`));
                }
                else {
                    // Logger already printed its own finish rule; just a blank line to breathe.
                    console.log();
                }
            }
            // Generate outputs
            const reportDir = path_1.default.resolve(opts['outputDir'] ?? path_1.default.join(options.path, '.ghostproto'));
            const needsFileOutput = outputFormats.some(f => f !== 'terminal') && !opts['json'];
            if (needsFileOutput) {
                fs_1.default.mkdirSync(reportDir, { recursive: true });
            }
            if (outputFormats.includes('terminal') && !opts['json']) {
                (0, terminal_1.printReport)(report);
            }
            if (outputFormats.includes('markdown')) {
                const mdPath = path_1.default.join(reportDir, 'audit-report.md');
                (0, markdown_1.generateMarkdownReport)(report, mdPath);
                if (!opts['json'] && !options.quiet) {
                    console.log(chalk_1.default.gray(`  📄 Markdown report → file:///${path_1.default.resolve(mdPath).replace(/\\/g, '/')}`));
                }
            }
            if (outputFormats.includes('html')) {
                const htmlPath = path_1.default.join(reportDir, 'audit-report.html');
                (0, html_1.generateHtmlReport)(report, htmlPath);
                if (!opts['json'] && !options.quiet) {
                    console.log(chalk_1.default.gray(`  🌐 HTML report    → file:///${path_1.default.resolve(htmlPath).replace(/\\/g, '/')}`));
                }
            }
            if (outputFormats.includes('json') || opts['json']) {
                if (opts['json']) {
                    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
                }
                else {
                    const jsonPath = path_1.default.join(reportDir, 'audit-report.json');
                    (0, json_1.generateJsonReport)(report, jsonPath);
                    if (!options.quiet) {
                        console.log(chalk_1.default.gray(`  📦 JSON report    → file:///${path_1.default.resolve(jsonPath).replace(/\\/g, '/')}`));
                    }
                }
            }
            // Exit code: 1 if critical issues found (useful for CI/CD)
            if (report.criticalCount > 0) {
                exitCode = 1;
            }
            if (!opts['json'] && !options.quiet) {
                console.log();
            }
        }
        catch (err) {
            if (spinner.isSpinning)
                spinner.fail(chalk_1.default.red('Audit failed'));
            console.error(chalk_1.default.red('\n  Error: ') + (err instanceof Error ? err.message : String(err)));
            console.error(chalk_1.default.gray('\n  Try running with --static if you don\'t have an API key.'));
            exitCode = 2;
        }
        process.exit(exitCode);
    });
    program.parse();
}
main().catch(err => {
    console.error(err);
    process.exit(2);
});
//# sourceMappingURL=index.js.map