// ─────────────────────────────────────────────
//  ghostproto — Interactive Console Explorer
// ─────────────────────────────────────────────

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { AuditReport, Finding, CategoryScore } from '../core/types';
import { renderSmoothBar, highlightCode, renderDiff, drawTable } from './terminal-utils';

const CATEGORY_ICONS: Record<string, string> = {
  security:      '🔒',
  quality:       '📊',
  performance:   '⚡',
  architecture:  '🏗️ ',
  dependencies:  '📦',
  testing:       '🧪',
  documentation: '📚',
};

export class InteractiveReporter {
  private report: AuditReport;
  private currentScreen: 'dashboard' | 'category' | 'finding' = 'dashboard';
  
  // Dashboard state
  private selectedCategoryIndex = 0;
  
  // Category state
  private activeCategory: CategoryScore | null = null;
  private selectedFindingIndex = 0;
  
  // Finding state
  private activeFinding: Finding | null = null;
  private showConfirmFix = false;
  private fixMessage = '';
  
  constructor(report: AuditReport) {
    this.report = report;
  }
  
  public start(): void {
    if (!process.stdin.isTTY) {
      console.log(chalk.red('Interactive mode requires a TTY terminal.'));
      process.exit(1);
    }
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    readline.emitKeypressEvents(process.stdin);
    
    this.clear();
    this.render();
    
    process.stdin.on('keypress', this.handleKeypress.bind(this));
  }
  
  private clear(): void {
    process.stdout.write('\x1Bc');
  }
  
  private handleKeypress(str: string, key: readline.Key): void {
    if ((key.ctrl && key.name === 'c') || (this.currentScreen === 'dashboard' && key.name === 'q')) {
      this.exit();
      return;
    }
    
    if (this.currentScreen === 'dashboard') {
      this.handleDashboardKeys(key);
    } else if (this.currentScreen === 'category') {
      this.handleCategoryKeys(key);
    } else if (this.currentScreen === 'finding') {
      this.handleFindingKeys(key);
    }
    
    this.clear();
    this.render();
  }
  
  private handleDashboardKeys(key: readline.Key): void {
    const cats = this.report.categories;
    if (key.name === 'up') {
      this.selectedCategoryIndex = (this.selectedCategoryIndex - 1 + cats.length) % cats.length;
    } else if (key.name === 'down') {
      this.selectedCategoryIndex = (this.selectedCategoryIndex + 1) % cats.length;
    } else if (key.name === 'return') {
      this.activeCategory = cats[this.selectedCategoryIndex];
      this.currentScreen = 'category';
      this.selectedFindingIndex = 0;
    } else if (key.name === 'escape') {
      this.exit();
    }
  }
  
  private handleCategoryKeys(key: readline.Key): void {
    if (!this.activeCategory) return;
    const findings = this.activeCategory.findings;
    
    if (key.name === 'up') {
      if (findings.length > 0) {
        this.selectedFindingIndex = (this.selectedFindingIndex - 1 + findings.length) % findings.length;
      }
    } else if (key.name === 'down') {
      if (findings.length > 0) {
        this.selectedFindingIndex = (this.selectedFindingIndex + 1) % findings.length;
      }
    } else if (key.name === 'escape' || key.name === 'b') {
      this.currentScreen = 'dashboard';
      this.activeCategory = null;
    } else if (key.name === 'return') {
      if (findings.length > 0) {
        this.activeFinding = findings[this.selectedFindingIndex];
        this.currentScreen = 'finding';
        this.showConfirmFix = false;
        this.fixMessage = '';
      }
    }
  }
  
  private handleFindingKeys(key: readline.Key): void {
    if (!this.activeFinding) return;
    
    if (this.showConfirmFix) {
      if (key.name === 'y') {
        this.applyProposedFix();
      } else if (key.name === 'n' || key.name === 'escape') {
        this.showConfirmFix = false;
      }
      return;
    }
    
    if (key.name === 'escape' || key.name === 'b') {
      this.currentScreen = 'category';
      this.activeFinding = null;
    } else if (key.name === 'f') {
      if (this.activeFinding.fix && this.activeFinding.snippet) {
        this.showConfirmFix = true;
      } else {
        this.fixMessage = chalk.red('No fix or snippet available for this finding.');
      }
    }
  }
  
  private applyProposedFix(): void {
    if (!this.activeFinding) return;
    try {
      const file = this.activeFinding.file;
      if (!file) {
        this.fixMessage = chalk.red('No target file specified for this finding.');
        this.showConfirmFix = false;
        return;
      }
      const filePath = path.resolve(this.report.project.path, file);
      if (!fs.existsSync(filePath)) {
        this.fixMessage = chalk.red(`File does not exist: ${file}`);
        this.showConfirmFix = false;
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf-8');
      const snippet = this.activeFinding.snippet;
      const fix = this.activeFinding.fix;
      
      if (!snippet || !fix) {
        this.fixMessage = chalk.red('Missing snippet or fix details.');
        this.showConfirmFix = false;
        return;
      }
      
      if (content.includes(snippet)) {
        content = content.replace(snippet, fix);
        fs.writeFileSync(filePath, content, 'utf-8');
        this.fixMessage = chalk.green('✔ Proposed fix successfully applied to file!');
        
        // Remove the finding from the report since it's now resolved
        if (this.activeCategory) {
          this.activeCategory.findings = this.activeCategory.findings.filter(f => f !== this.activeFinding);
        }
        this.report.allFindings = this.report.allFindings.filter(f => f !== this.activeFinding);
        
        // Recalculate summary counts
        this.recalculateCounts();
      } else {
        this.fixMessage = chalk.yellow('⚠ Could not match the exact code snippet in file. Snippet might have changed.');
      }
    } catch (err: any) {
      this.fixMessage = chalk.red(`Error applying fix: ${err.message}`);
    }
    this.showConfirmFix = false;
  }
  
  private recalculateCounts(): void {
    let critical = 0, high = 0, medium = 0, low = 0;
    for (const f of this.report.allFindings) {
      if (f.severity === 'critical') critical++;
      else if (f.severity === 'high') high++;
      else if (f.severity === 'medium') medium++;
      else if (f.severity === 'low') low++;
    }
    this.report.criticalCount = critical;
    this.report.highCount = high;
    this.report.mediumCount = medium;
    this.report.lowCount = low;
  }
  
  private exit(): void {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    this.clear();
    console.log(chalk.hex('#2dbfad')('Interactive session closed. Goodbye!'));
    process.exit(0);
  }
  
  private render(): void {
    this.renderHeader();
    if (this.currentScreen === 'dashboard') {
      this.renderDashboard();
    } else if (this.currentScreen === 'category') {
      this.renderCategory();
    } else if (this.currentScreen === 'finding') {
      this.renderFinding();
    }
  }
  
  private renderHeader(): void {
    const title = chalk.hex('#4ee6d3').bold(' GHOSTPROTO INTERACTIVE AUDIT EXPLORER ');
    const scoreColor = this.report.overallScore >= 80 ? chalk.hex('#4ee6d3') : this.report.overallScore >= 60 ? chalk.hex('#2dbfad') : chalk.hex('#C44536');
    const scoreBox = scoreColor.bold(`[SCORE: ${this.report.overallScore}/100 Grade: ${this.report.overallGrade}]`);
    console.log(chalk.hex('#1d8a7c')(`┌─${'─'.repeat(Math.max(10, 76 - scoreBox.length - 2))}─┐`));
    console.log(chalk.hex('#1d8a7c')(`│ `) + title + ' '.repeat(Math.max(0, 76 - title.length - scoreBox.length - 4)) + scoreBox + chalk.hex('#1d8a7c')(` │`));
    console.log(chalk.hex('#1d8a7c')(`└─${'─'.repeat(76)}─┘`));
    console.log();
  }
  
  private renderDashboard(): void {
    console.log(chalk.hex('#4ee6d3').bold('  PROJECT DETAILS'));
    console.log(chalk.gray('  ────────────────'));
    console.log(`  ${chalk.hex('#5ba399')('Project:')}  ${chalk.white(this.report.project.name)}`);
    console.log(`  ${chalk.hex('#5ba399')('Path:')}     ${chalk.gray(this.report.project.path)}`);
    console.log(`  ${chalk.hex('#5ba399')('Files:')}    ${chalk.white(String(this.report.project.totalFiles))} files · ${chalk.white(this.report.project.totalLines.toLocaleString())} lines`);
    console.log(`  ${chalk.hex('#5ba399')('Stack:')}    ${chalk.hex('#2dbfad')(Object.keys(this.report.project.languages).join(', '))}`);
    console.log();
    
    console.log(chalk.hex('#4ee6d3').bold('  CATEGORIES'));
    console.log(chalk.gray('  ────────────────'));
    
    const headers = ['Category', 'Score', 'Grade', 'Issues Status'];
    const rows = this.report.categories.map((cat, idx) => {
      const isSelected = idx === this.selectedCategoryIndex;
      const prefix = isSelected ? chalk.hex('#4ee6d3').bold('→ ') : '  ';
      const icon = CATEGORY_ICONS[cat.category] || '';
      
      const catLabel = isSelected
        ? chalk.hex('#4ee6d3').bold(`${icon} ${cat.category.toUpperCase()}`)
        : chalk.hex('#e6f7f5')(`${icon} ${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}`);
        
      const bar = renderSmoothBar(cat.score, 15);
      const scoreStr = isSelected 
        ? chalk.hex('#4ee6d3').bold(`${cat.score}/100`) 
        : chalk.hex('#5ba399')(`${cat.score}/100`);
      const gradeStr = isSelected 
        ? chalk.hex('#4ee6d3').bold(`[${cat.grade}]`)
        : chalk.hex('#5ba399')(`[${cat.grade}]`);
        
      const issues = cat.findings.length;
      const issuesStr = issues > 0 
        ? chalk.hex('#C44536').bold(`${issues} issues`)
        : chalk.hex('#4ee6d3')('Clean');
        
      return [
        prefix + catLabel,
        bar + '  ' + scoreStr,
        gradeStr,
        issuesStr
      ];
    });
    
    console.log(drawTable(headers, rows));
    console.log();
    
    console.log(chalk.hex('#4ee6d3').bold('  FINDINGS SUMMARY'));
    console.log(chalk.gray('  ────────────────'));
    const summary = [
      `${chalk.hex('#C44536').bold('Critical:')} ${this.report.criticalCount}`,
      `${chalk.hex('#1d8a7c').bold('High:')}     ${this.report.highCount}`,
      `${chalk.hex('#64dfdf').bold('Medium:')}   ${this.report.mediumCount}`,
      `${chalk.hex('#4ee6d3').bold('Low:')}      ${this.report.lowCount}`,
    ].join('   |   ');
    console.log('  ' + summary);
    console.log();
    
    console.log(chalk.gray('  Navigation: [↑/↓] Select Category   [Enter] View Category   [q/Esc] Quit'));
  }
  
  private renderCategory(): void {
    if (!this.activeCategory) return;
    const cat = this.activeCategory;
    const icon = CATEGORY_ICONS[cat.category] || '';
    
    console.log(`  ${icon} ${chalk.hex('#4ee6d3').bold(cat.category.toUpperCase() + ' CATEGORY')}`);
    console.log(chalk.gray('  ──────────────────────────────────────────────────'));
    console.log(`  Score: ${chalk.hex('#2dbfad')(String(cat.score))}   Grade: ${chalk.hex('#4ee6d3')(cat.grade)}   Issues: ${chalk.hex('#C44536')(String(cat.findings.length))}`);
    console.log();
    
    if (cat.findings.length === 0) {
      console.log(chalk.green('  ✔ Excellent — no issues found in this category!'));
      console.log();
      console.log(chalk.gray('  Navigation: [Esc/b] Go Back'));
      return;
    }
    
    const headers = ['#', 'Severity', 'Title', 'File Location'];
    const rows = cat.findings.map((f, idx) => {
      const isSelected = idx === this.selectedFindingIndex;
      const prefix = isSelected ? chalk.hex('#4ee6d3').bold('→ ') : '  ';
      
      let sevBadge = chalk.hex('#5ba399')(f.severity.toUpperCase());
      if (f.severity === 'critical') sevBadge = chalk.bgHex('#C44536').hex('#FFF5EC').bold(' CRITICAL ');
      else if (f.severity === 'high') sevBadge = chalk.hex('#C44536').bold(' HIGH ');
      else if (f.severity === 'medium') sevBadge = chalk.hex('#1d8a7c').bold(' MEDIUM ');
      else if (f.severity === 'low') sevBadge = chalk.hex('#64dfdf').bold(' LOW ');
      
      const title = isSelected ? chalk.hex('#4ee6d3').bold(f.title) : chalk.hex('#e6f7f5')(f.title);
      const loc = isSelected ? chalk.white(f.file + (f.line ? `:${f.line}` : '')) : chalk.gray(f.file + (f.line ? `:${f.line}` : ''));
      
      return [
        prefix + (idx + 1),
        sevBadge,
        title,
        loc
      ];
    });
    
    console.log(drawTable(headers, rows));
    console.log();
    
    console.log(chalk.gray('  Navigation: [↑/↓] Select Finding   [Enter] View Details   [Esc/b] Go Back'));
  }
  
  private renderFinding(): void {
    if (!this.activeFinding) return;
    const f = this.activeFinding;
    
    let sevBadge = chalk.hex('#5ba399')(f.severity.toUpperCase());
    if (f.severity === 'critical') sevBadge = chalk.bgHex('#C44536').hex('#FFF5EC').bold(' CRITICAL ');
    else if (f.severity === 'high') sevBadge = chalk.hex('#C44536').bold(' HIGH ');
    else if (f.severity === 'medium') sevBadge = chalk.hex('#1d8a7c').bold(' MEDIUM ');
    else if (f.severity === 'low') sevBadge = chalk.hex('#64dfdf').bold(' LOW ');
    
    console.log(`  ${chalk.hex('#4ee6d3').bold('FINDING DETAILS')}  ·  ${sevBadge}`);
    console.log(chalk.gray('  ──────────────────────────────────────────────────'));
    console.log(`  ${chalk.hex('#5ba399')('Title:')}       ${chalk.hex('#e6f7f5').bold(f.title)}`);
    console.log(`  ${chalk.hex('#5ba399')('File:')}        ${chalk.white(f.file || 'unknown')}${f.line ? chalk.gray(` (line ${f.line})`) : ''}`);
    console.log(`  ${chalk.hex('#5ba399')('Category:')}    ${chalk.gray(f.category)}`);
    console.log(`  ${chalk.hex('#5ba399')('Description:')} ${chalk.hex('#e6f7f5')(f.description)}`);
    console.log();
    
    if (f.snippet) {
      console.log(chalk.hex('#4ee6d3').bold('  CODE SNIPPET'));
      console.log(chalk.gray('  ──────────────'));
      const ext = f.file ? path.extname(f.file).slice(1) : 'typescript';
      const highlighted = highlightCode(f.snippet, ext);
      console.log(highlighted.split('\n').map(l => '  ' + l).join('\n'));
      console.log();
    }
    
    if (f.snippet && f.fix) {
      console.log(chalk.hex('#4ee6d3').bold('  PROPOSED FIX DIFF'));
      console.log(chalk.gray('  ───────────────────'));
      const diffOutput = renderDiff(f.snippet, f.fix, f.file || 'unknown', f.line || 1);
      console.log(diffOutput.split('\n').map(l => '  ' + l).join('\n'));
      console.log();
    } else if (f.fix) {
      console.log(chalk.hex('#4ee6d3').bold('  PROPOSED FIX'));
      console.log(chalk.gray('  ──────────────'));
      console.log('  ' + chalk.green(f.fix));
      console.log();
    }
    
    if (this.showConfirmFix) {
      console.log(chalk.bgHex('#ffb86c').black.bold(' CONFIRM FIX ') + chalk.yellow(` Are you sure you want to modify ${f.file || 'unknown'}? [y/n]`));
      console.log();
    }
    
    if (this.fixMessage) {
      console.log('  ' + this.fixMessage);
      console.log();
    }
    
    if (!this.showConfirmFix) {
      const fixLabel = (f.snippet && f.fix) ? chalk.hex('#4ee6d3').bold(' [f] Apply proposed fix ') : '';
      console.log(chalk.gray('  Navigation:') + fixLabel + chalk.gray('   [Esc/b] Back to Category'));
    }
  }
}
