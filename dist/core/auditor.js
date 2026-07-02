"use strict";
// ─────────────────────────────────────────────
//  claude-audit — Main Auditor Orchestrator
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = runAudit;
const types_1 = require("./types");
const scanner_1 = require("./scanner");
const secrets_1 = require("../analyzers/static/secrets");
const dependencies_1 = require("../analyzers/static/dependencies");
const complexity_1 = require("../analyzers/static/complexity");
const ghostproto_analyzer_1 = require("../analyzers/ai/ghostproto-analyzer");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: VERSION } = require('../../package.json');
function mergeStaticIntoCategories(categories, staticFindings) {
    const categoryMap = new Map(categories.map(c => [c.category, c]));
    for (const finding of staticFindings) {
        const cat = categoryMap.get(finding.category);
        if (cat) {
            cat.findings.push(finding);
            const penalty = finding.severity === 'critical' ? 15
                : finding.severity === 'high' ? 8
                    : finding.severity === 'medium' ? 4
                        : finding.severity === 'low' ? 2 : 0;
            cat.score = Math.max(0, cat.score - penalty);
            cat.grade = (0, types_1.scoreToGrade)(cat.score);
        }
        else {
            categoryMap.set(finding.category, {
                category: finding.category,
                score: 70,
                grade: 'C',
                findings: [finding],
                summary: 'Static analysis findings.',
            });
        }
    }
    return Array.from(categoryMap.values());
}
function buildStaticOnlyCategories(staticFindings, filterCategories) {
    const allCategories = ['security', 'quality', 'performance', 'architecture', 'dependencies', 'testing', 'documentation'];
    const categories = filterCategories ?? allCategories;
    const catFindings = new Map();
    categories.forEach(c => catFindings.set(c, []));
    for (const f of staticFindings) {
        catFindings.get(f.category)?.push(f);
    }
    return categories.map(cat => {
        const findings = catFindings.get(cat) ?? [];
        let score = 80;
        for (const f of findings) {
            score -= f.severity === 'critical' ? 20 : f.severity === 'high' ? 10 : f.severity === 'medium' ? 5 : 2;
        }
        score = Math.max(0, score);
        return { category: cat, score, grade: (0, types_1.scoreToGrade)(score), findings, summary: '' };
    });
}
async function runAudit(options, onProgress, hooks = {}) {
    const startTime = Date.now();
    // ── 1. Scan files ─────────────────────────
    onProgress('Scanning project files...');
    const { files, info } = await (0, scanner_1.scanProject)(options.path, options.maxFiles, options.maxFileSize);
    // ── 2. Static analysis ────────────────────
    onProgress('Running static security analysis...');
    const secretFindings = (0, secrets_1.analyzeSecrets)(files);
    onProgress('Analyzing dependencies...');
    const depFindings = (0, dependencies_1.analyzeDependencies)(info);
    onProgress('Checking code complexity & quality...');
    const complexityFindings = (0, complexity_1.analyzeComplexity)(files);
    const allStaticFindings = ([...secretFindings, ...depFindings, ...complexityFindings])
        .filter(f => !options.categories || options.categories.includes(f.category));
    // ── 3. AI analysis ────────────────────────
    let categories;
    let aiPowered = false;
    let agentic = false;
    let agentTrace;
    const apiKey = options.apiKey ?? process.env.GHOSTPROTO_API_KEY;
    if (!options.noAi && apiKey) {
        if (options.agentic) {
            onProgress('Starting agentic audit (GhostProto will investigate via tools)...');
            try {
                const result = await (0, ghostproto_analyzer_1.analyzeWithGhostProtoAgent)({
                    projectRoot: options.path,
                    info,
                    staticFindings: allStaticFindings,
                    apiKey,
                    model: options.model,
                    maxTurns: options.maxTurns,
                    maxBudgetTokens: options.maxBudgetTokens,
                    filterCategories: options.categories,
                    files,
                    hooks: {
                        onProgress: (m) => {
                            hooks.agent?.onProgress?.(m);
                            onProgress(m);
                        },
                        onToolCall: hooks.agent?.onToolCall,
                        onTurnStart: hooks.agent?.onTurnStart,
                        onTurnEnd: hooks.agent?.onTurnEnd,
                        onApiResponse: hooks.agent?.onApiResponse,
                        onFinish: hooks.agent?.onFinish,
                    },
                });
                categories = mergeStaticIntoCategories(result.categories, allStaticFindings);
                agentTrace = result.trace;
                agentic = true;
                aiPowered = true;
                // If the agent didn't finalize, gracefully degrade to static-only
                if (result.trace.summary.stopReason !== 'completed') {
                    onProgress(`⚠ Agentic audit stopped early (${result.trace.summary.stopReason}). Merging partial findings with static analysis.`);
                }
            }
            catch (err) {
                onProgress(`⚠ Agentic analysis failed (${err instanceof Error ? err.message : 'unknown error'}). Falling back to one-shot analysis.`);
                try {
                    categories = await (0, ghostproto_analyzer_1.analyzeWithGhostProto)(files, info, apiKey, options.model, options.categories);
                    categories = mergeStaticIntoCategories(categories, allStaticFindings);
                    aiPowered = true;
                }
                catch (err2) {
                    onProgress(`⚠ One-shot analysis also failed (${err2 instanceof Error ? err2.message : 'unknown error'}). Falling back to static analysis only.`);
                    categories = buildStaticOnlyCategories(allStaticFindings, options.categories);
                }
            }
            if (depFindings.length > 0 && !categories.find(c => c.category === 'dependencies')) {
                const depScore = Math.max(0, 80 - depFindings.length * 8);
                categories.push({
                    category: 'dependencies',
                    score: depScore,
                    grade: (0, types_1.scoreToGrade)(depScore),
                    findings: depFindings,
                    summary: `${depFindings.length} dependency issue(s) found.`,
                });
            }
        }
        else {
            onProgress('Sending codebase to GhostProto for one-shot analysis...');
            try {
                categories = await (0, ghostproto_analyzer_1.analyzeWithGhostProto)(files, info, apiKey, options.model, options.categories);
                categories = mergeStaticIntoCategories(categories, allStaticFindings);
                aiPowered = true;
                // Ensure dependencies category exists if we have dep findings
                if (depFindings.length > 0 && !categories.find(c => c.category === 'dependencies')) {
                    const depScore = Math.max(0, 80 - depFindings.length * 8);
                    categories.push({
                        category: 'dependencies',
                        score: depScore,
                        grade: (0, types_1.scoreToGrade)(depScore),
                        findings: depFindings,
                        summary: `${depFindings.length} dependency issue(s) found.`,
                    });
                }
            }
            catch (err) {
                onProgress(`⚠ AI analysis failed (${err instanceof Error ? err.message : 'unknown error'}). Falling back to static analysis only.`);
                categories = buildStaticOnlyCategories(allStaticFindings, options.categories);
            }
        }
    }
    else {
        if (!options.quiet && !apiKey && !options.noAi) {
            onProgress('⚡ Running fast static analysis (15+ built-in rules)...');
            onProgress('💡 Tip: Run \'ghost key <value>\' to set up your API key for deep AI analysis.');
        }
        else if (!options.quiet && options.noAi) {
            onProgress('⚡ Running static analysis (--static mode)...');
        }
        categories = buildStaticOnlyCategories(allStaticFindings, options.categories);
    }
    // Filter to requested categories
    if (options.categories) {
        categories = categories.filter(c => options.categories.includes(c.category));
    }
    // ── 4. Compute overall score ───────────────
    const categoryWeights = {
        security: 0.25,
        quality: 0.20,
        performance: 0.15,
        architecture: 0.15,
        dependencies: 0.10,
        testing: 0.10,
        documentation: 0.05,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    for (const cat of categories) {
        const weight = categoryWeights[cat.category] ?? 0.1;
        weightedSum += cat.score * weight;
        totalWeight += weight;
    }
    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
    const allFindings = categories.flatMap(c => c.findings);
    return {
        version: VERSION,
        timestamp: new Date().toISOString(),
        project: info,
        overallScore,
        overallGrade: (0, types_1.scoreToGrade)(overallScore),
        categories,
        allFindings,
        criticalCount: allFindings.filter(f => f.severity === 'critical').length,
        highCount: allFindings.filter(f => f.severity === 'high').length,
        mediumCount: allFindings.filter(f => f.severity === 'medium').length,
        lowCount: allFindings.filter(f => f.severity === 'low').length,
        aiPowered,
        agentic: agentic || undefined,
        agentTrace,
        durationMs: Date.now() - startTime,
    };
}
//# sourceMappingURL=auditor.js.map