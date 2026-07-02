import { Finding } from '../../../analysis/store/evidence';

export class ReportBuilder {
  public static buildMarkdown(findings: Finding[]): string {
    let md = `# Audit Execution Report\n\n`;
    md += `Total Verified Findings: ${findings.length}\n\n`;

    for (const f of findings) {
      md += `## [${f.severity.toUpperCase()}] Rule: ${f.ruleId}\n`;
      md += `* **File:** ${f.filePath}\n`;
      md += `* **Message:** ${f.message}\n\n`;
    }

    return md;
  }

  public static buildJSON(findings: Finding[]): string {
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      findingsCount: findings.length,
      findings
    }, null, 2);
  }
}
