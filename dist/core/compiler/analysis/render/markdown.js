"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownRenderer = void 0;
class MarkdownRenderer {
    static render(pkg) {
        const lines = [];
        lines.push(`# Context Package: ${pkg.policyName || 'Default policy'}`);
        // Render metrics
        lines.push('## Metrics');
        lines.push(`* Symbols: ${pkg.metrics.symbolCount}`);
        lines.push(`* Findings: ${pkg.metrics.findingsCount}`);
        lines.push(`* Dependency paths: ${pkg.metrics.pathsCount}`);
        // Render findings
        if (pkg.findings.length > 0) {
            lines.push('## Findings');
            for (const f of pkg.findings) {
                lines.push(`### [${f.ruleId}] ${f.filePath}`);
                lines.push(`* Severity: ${f.severity}`);
                lines.push(`* Message: ${f.message}`);
            }
        }
        // Render symbols
        if (pkg.symbols.length > 0) {
            lines.push('## Symbols');
            for (const s of pkg.symbols) {
                lines.push(`* \`${s.fqn}\` (${s.symbolKind})`);
            }
        }
        return lines.join('\n');
    }
}
exports.MarkdownRenderer = MarkdownRenderer;
//# sourceMappingURL=markdown.js.map