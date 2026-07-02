"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilder = void 0;
class ReportBuilder {
    static buildMarkdown(findings) {
        let md = `# Audit Execution Report\n\n`;
        md += `Total Verified Findings: ${findings.length}\n\n`;
        for (const f of findings) {
            md += `## [${f.severity.toUpperCase()}] Rule: ${f.ruleId}\n`;
            md += `* **File:** ${f.filePath}\n`;
            md += `* **Message:** ${f.message}\n\n`;
        }
        return md;
    }
    static buildJSON(findings) {
        return JSON.stringify({
            generatedAt: new Date().toISOString(),
            findingsCount: findings.length,
            findings
        }, null, 2);
    }
}
exports.ReportBuilder = ReportBuilder;
//# sourceMappingURL=builder.js.map