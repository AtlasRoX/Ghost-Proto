"use strict";
// ─────────────────────────────────────────────
//  ghostproto — Interactive Console Explorer
// ─────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveReporter = void 0;
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const terminal_utils_1 = require("./terminal-utils");
const CATEGORY_ICONS = {
    security: '🔒',
    quality: '📊',
    performance: '⚡',
    architecture: '🏗️ ',
    dependencies: '📦',
    testing: '🧪',
    documentation: '📚',
};
class InteractiveReporter {
    constructor(report) {
        this.currentScreen = 'dashboard';
        // Dashboard state
        this.selectedCategoryIndex = 0;
        // Category state
        this.activeCategory = null;
        this.selectedFindingIndex = 0;
        // Finding state
        this.activeFinding = null;
        this.showConfirmFix = false;
        this.fixMessage = '';
        this.report = report;
    }
    start() {
        if (!process.stdin.isTTY) {
            console.log(chalk_1.default.red('Interactive mode requires a TTY terminal.'));
            process.exit(1);
        }
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        readline_1.default.emitKeypressEvents(process.stdin);
        this.clear();
        this.render();
        process.stdin.on('keypress', this.handleKeypress.bind(this));
    }
    clear() {
        process.stdout.write('\x1Bc');
    }
    handleKeypress(str, key) {
        if ((key.ctrl && key.name === 'c') || (this.currentScreen === 'dashboard' && key.name === 'q')) {
            this.exit();
            return;
        }
        if (this.currentScreen === 'dashboard') {
            this.handleDashboardKeys(key);
        }
        else if (this.currentScreen === 'category') {
            this.handleCategoryKeys(key);
        }
        else if (this.currentScreen === 'finding') {
            this.handleFindingKeys(key);
        }
        this.clear();
        this.render();
    }
    handleDashboardKeys(key) {
        const cats = this.report.categories;
        if (key.name === 'up') {
            this.selectedCategoryIndex = (this.selectedCategoryIndex - 1 + cats.length) % cats.length;
        }
        else if (key.name === 'down') {
            this.selectedCategoryIndex = (this.selectedCategoryIndex + 1) % cats.length;
        }
        else if (key.name === 'return') {
            this.activeCategory = cats[this.selectedCategoryIndex];
            this.currentScreen = 'category';
            this.selectedFindingIndex = 0;
        }
        else if (key.name === 'escape') {
            this.exit();
        }
    }
    handleCategoryKeys(key) {
        if (!this.activeCategory)
            return;
        const findings = this.activeCategory.findings;
        if (key.name === 'up') {
            if (findings.length > 0) {
                this.selectedFindingIndex = (this.selectedFindingIndex - 1 + findings.length) % findings.length;
            }
        }
        else if (key.name === 'down') {
            if (findings.length > 0) {
                this.selectedFindingIndex = (this.selectedFindingIndex + 1) % findings.length;
            }
        }
        else if (key.name === 'escape' || key.name === 'b') {
            this.currentScreen = 'dashboard';
            this.activeCategory = null;
        }
        else if (key.name === 'return') {
            if (findings.length > 0) {
                this.activeFinding = findings[this.selectedFindingIndex];
                this.currentScreen = 'finding';
                this.showConfirmFix = false;
                this.fixMessage = '';
            }
        }
    }
    handleFindingKeys(key) {
        if (!this.activeFinding)
            return;
        if (this.showConfirmFix) {
            if (key.name === 'y') {
                this.applyProposedFix();
            }
            else if (key.name === 'n' || key.name === 'escape') {
                this.showConfirmFix = false;
            }
            return;
        }
        if (key.name === 'escape' || key.name === 'b') {
            this.currentScreen = 'category';
            this.activeFinding = null;
        }
        else if (key.name === 'f') {
            if (this.activeFinding.fix && this.activeFinding.snippet) {
                this.showConfirmFix = true;
            }
            else {
                this.fixMessage = chalk_1.default.red('No fix or snippet available for this finding.');
            }
        }
    }
    applyProposedFix() {
        if (!this.activeFinding)
            return;
        try {
            const file = this.activeFinding.file;
            if (!file) {
                this.fixMessage = chalk_1.default.red('No target file specified for this finding.');
                this.showConfirmFix = false;
                return;
            }
            const filePath = path_1.default.resolve(this.report.project.path, file);
            if (!fs_1.default.existsSync(filePath)) {
                this.fixMessage = chalk_1.default.red(`File does not exist: ${file}`);
                this.showConfirmFix = false;
                return;
            }
            let content = fs_1.default.readFileSync(filePath, 'utf-8');
            const snippet = this.activeFinding.snippet;
            const fix = this.activeFinding.fix;
            if (!snippet || !fix) {
                this.fixMessage = chalk_1.default.red('Missing snippet or fix details.');
                this.showConfirmFix = false;
                return;
            }
            if (content.includes(snippet)) {
                content = content.replace(snippet, fix);
                fs_1.default.writeFileSync(filePath, content, 'utf-8');
                this.fixMessage = chalk_1.default.green('✔ Proposed fix successfully applied to file!');
                // Remove the finding from the report since it's now resolved
                if (this.activeCategory) {
                    this.activeCategory.findings = this.activeCategory.findings.filter(f => f !== this.activeFinding);
                }
                this.report.allFindings = this.report.allFindings.filter(f => f !== this.activeFinding);
                // Recalculate summary counts
                this.recalculateCounts();
            }
            else {
                this.fixMessage = chalk_1.default.yellow('⚠ Could not match the exact code snippet in file. Snippet might have changed.');
            }
        }
        catch (err) {
            this.fixMessage = chalk_1.default.red(`Error applying fix: ${err.message}`);
        }
        this.showConfirmFix = false;
    }
    recalculateCounts() {
        let critical = 0, high = 0, medium = 0, low = 0;
        for (const f of this.report.allFindings) {
            if (f.severity === 'critical')
                critical++;
            else if (f.severity === 'high')
                high++;
            else if (f.severity === 'medium')
                medium++;
            else if (f.severity === 'low')
                low++;
        }
        this.report.criticalCount = critical;
        this.report.highCount = high;
        this.report.mediumCount = medium;
        this.report.lowCount = low;
    }
    exit() {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        this.clear();
        console.log(chalk_1.default.hex('#2dbfad')('Interactive session closed. Goodbye!'));
        process.exit(0);
    }
    render() {
        this.renderHeader();
        if (this.currentScreen === 'dashboard') {
            this.renderDashboard();
        }
        else if (this.currentScreen === 'category') {
            this.renderCategory();
        }
        else if (this.currentScreen === 'finding') {
            this.renderFinding();
        }
    }
    renderHeader() {
        const title = chalk_1.default.hex('#4ee6d3').bold(' GHOSTPROTO INTERACTIVE AUDIT EXPLORER ');
        const scoreColor = this.report.overallScore >= 80 ? chalk_1.default.hex('#4ee6d3') : this.report.overallScore >= 60 ? chalk_1.default.hex('#2dbfad') : chalk_1.default.hex('#C44536');
        const scoreBox = scoreColor.bold(`[SCORE: ${this.report.overallScore}/100 Grade: ${this.report.overallGrade}]`);
        console.log(chalk_1.default.hex('#1d8a7c')(`┌─${'─'.repeat(Math.max(10, 76 - scoreBox.length - 2))}─┐`));
        console.log(chalk_1.default.hex('#1d8a7c')(`│ `) + title + ' '.repeat(Math.max(0, 76 - title.length - scoreBox.length - 4)) + scoreBox + chalk_1.default.hex('#1d8a7c')(` │`));
        console.log(chalk_1.default.hex('#1d8a7c')(`└─${'─'.repeat(76)}─┘`));
        console.log();
    }
    renderDashboard() {
        console.log(chalk_1.default.hex('#4ee6d3').bold('  PROJECT DETAILS'));
        console.log(chalk_1.default.gray('  ────────────────'));
        console.log(`  ${chalk_1.default.hex('#5ba399')('Project:')}  ${chalk_1.default.white(this.report.project.name)}`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('Path:')}     ${chalk_1.default.gray(this.report.project.path)}`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('Files:')}    ${chalk_1.default.white(String(this.report.project.totalFiles))} files · ${chalk_1.default.white(this.report.project.totalLines.toLocaleString())} lines`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('Stack:')}    ${chalk_1.default.hex('#2dbfad')(Object.keys(this.report.project.languages).join(', '))}`);
        console.log();
        console.log(chalk_1.default.hex('#4ee6d3').bold('  CATEGORIES'));
        console.log(chalk_1.default.gray('  ────────────────'));
        const headers = ['Category', 'Score', 'Grade', 'Issues Status'];
        const rows = this.report.categories.map((cat, idx) => {
            const isSelected = idx === this.selectedCategoryIndex;
            const prefix = isSelected ? chalk_1.default.hex('#4ee6d3').bold('→ ') : '  ';
            const icon = CATEGORY_ICONS[cat.category] || '';
            const catLabel = isSelected
                ? chalk_1.default.hex('#4ee6d3').bold(`${icon} ${cat.category.toUpperCase()}`)
                : chalk_1.default.hex('#e6f7f5')(`${icon} ${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}`);
            const bar = (0, terminal_utils_1.renderSmoothBar)(cat.score, 15);
            const scoreStr = isSelected
                ? chalk_1.default.hex('#4ee6d3').bold(`${cat.score}/100`)
                : chalk_1.default.hex('#5ba399')(`${cat.score}/100`);
            const gradeStr = isSelected
                ? chalk_1.default.hex('#4ee6d3').bold(`[${cat.grade}]`)
                : chalk_1.default.hex('#5ba399')(`[${cat.grade}]`);
            const issues = cat.findings.length;
            const issuesStr = issues > 0
                ? chalk_1.default.hex('#C44536').bold(`${issues} issues`)
                : chalk_1.default.hex('#4ee6d3')('Clean');
            return [
                prefix + catLabel,
                bar + '  ' + scoreStr,
                gradeStr,
                issuesStr
            ];
        });
        console.log((0, terminal_utils_1.drawTable)(headers, rows));
        console.log();
        console.log(chalk_1.default.hex('#4ee6d3').bold('  FINDINGS SUMMARY'));
        console.log(chalk_1.default.gray('  ────────────────'));
        const summary = [
            `${chalk_1.default.hex('#C44536').bold('Critical:')} ${this.report.criticalCount}`,
            `${chalk_1.default.hex('#1d8a7c').bold('High:')}     ${this.report.highCount}`,
            `${chalk_1.default.hex('#64dfdf').bold('Medium:')}   ${this.report.mediumCount}`,
            `${chalk_1.default.hex('#4ee6d3').bold('Low:')}      ${this.report.lowCount}`,
        ].join('   |   ');
        console.log('  ' + summary);
        console.log();
        console.log(chalk_1.default.gray('  Navigation: [↑/↓] Select Category   [Enter] View Category   [q/Esc] Quit'));
    }
    renderCategory() {
        if (!this.activeCategory)
            return;
        const cat = this.activeCategory;
        const icon = CATEGORY_ICONS[cat.category] || '';
        console.log(`  ${icon} ${chalk_1.default.hex('#4ee6d3').bold(cat.category.toUpperCase() + ' CATEGORY')}`);
        console.log(chalk_1.default.gray('  ──────────────────────────────────────────────────'));
        console.log(`  Score: ${chalk_1.default.hex('#2dbfad')(String(cat.score))}   Grade: ${chalk_1.default.hex('#4ee6d3')(cat.grade)}   Issues: ${chalk_1.default.hex('#C44536')(String(cat.findings.length))}`);
        console.log();
        if (cat.findings.length === 0) {
            console.log(chalk_1.default.green('  ✔ Excellent — no issues found in this category!'));
            console.log();
            console.log(chalk_1.default.gray('  Navigation: [Esc/b] Go Back'));
            return;
        }
        const headers = ['#', 'Severity', 'Title', 'File Location'];
        const rows = cat.findings.map((f, idx) => {
            const isSelected = idx === this.selectedFindingIndex;
            const prefix = isSelected ? chalk_1.default.hex('#4ee6d3').bold('→ ') : '  ';
            let sevBadge = chalk_1.default.hex('#5ba399')(f.severity.toUpperCase());
            if (f.severity === 'critical')
                sevBadge = chalk_1.default.bgHex('#C44536').hex('#FFF5EC').bold(' CRITICAL ');
            else if (f.severity === 'high')
                sevBadge = chalk_1.default.hex('#C44536').bold(' HIGH ');
            else if (f.severity === 'medium')
                sevBadge = chalk_1.default.hex('#1d8a7c').bold(' MEDIUM ');
            else if (f.severity === 'low')
                sevBadge = chalk_1.default.hex('#64dfdf').bold(' LOW ');
            const title = isSelected ? chalk_1.default.hex('#4ee6d3').bold(f.title) : chalk_1.default.hex('#e6f7f5')(f.title);
            const loc = isSelected ? chalk_1.default.white(f.file + (f.line ? `:${f.line}` : '')) : chalk_1.default.gray(f.file + (f.line ? `:${f.line}` : ''));
            return [
                prefix + (idx + 1),
                sevBadge,
                title,
                loc
            ];
        });
        console.log((0, terminal_utils_1.drawTable)(headers, rows));
        console.log();
        console.log(chalk_1.default.gray('  Navigation: [↑/↓] Select Finding   [Enter] View Details   [Esc/b] Go Back'));
    }
    renderFinding() {
        if (!this.activeFinding)
            return;
        const f = this.activeFinding;
        let sevBadge = chalk_1.default.hex('#5ba399')(f.severity.toUpperCase());
        if (f.severity === 'critical')
            sevBadge = chalk_1.default.bgHex('#C44536').hex('#FFF5EC').bold(' CRITICAL ');
        else if (f.severity === 'high')
            sevBadge = chalk_1.default.hex('#C44536').bold(' HIGH ');
        else if (f.severity === 'medium')
            sevBadge = chalk_1.default.hex('#1d8a7c').bold(' MEDIUM ');
        else if (f.severity === 'low')
            sevBadge = chalk_1.default.hex('#64dfdf').bold(' LOW ');
        console.log(`  ${chalk_1.default.hex('#4ee6d3').bold('FINDING DETAILS')}  ·  ${sevBadge}`);
        console.log(chalk_1.default.gray('  ──────────────────────────────────────────────────'));
        console.log(`  ${chalk_1.default.hex('#5ba399')('Title:')}       ${chalk_1.default.hex('#e6f7f5').bold(f.title)}`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('File:')}        ${chalk_1.default.white(f.file || 'unknown')}${f.line ? chalk_1.default.gray(` (line ${f.line})`) : ''}`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('Category:')}    ${chalk_1.default.gray(f.category)}`);
        console.log(`  ${chalk_1.default.hex('#5ba399')('Description:')} ${chalk_1.default.hex('#e6f7f5')(f.description)}`);
        console.log();
        if (f.snippet) {
            console.log(chalk_1.default.hex('#4ee6d3').bold('  CODE SNIPPET'));
            console.log(chalk_1.default.gray('  ──────────────'));
            const ext = f.file ? path_1.default.extname(f.file).slice(1) : 'typescript';
            const highlighted = (0, terminal_utils_1.highlightCode)(f.snippet, ext);
            console.log(highlighted.split('\n').map(l => '  ' + l).join('\n'));
            console.log();
        }
        if (f.snippet && f.fix) {
            console.log(chalk_1.default.hex('#4ee6d3').bold('  PROPOSED FIX DIFF'));
            console.log(chalk_1.default.gray('  ───────────────────'));
            const diffOutput = (0, terminal_utils_1.renderDiff)(f.snippet, f.fix, f.file || 'unknown', f.line || 1);
            console.log(diffOutput.split('\n').map(l => '  ' + l).join('\n'));
            console.log();
        }
        else if (f.fix) {
            console.log(chalk_1.default.hex('#4ee6d3').bold('  PROPOSED FIX'));
            console.log(chalk_1.default.gray('  ──────────────'));
            console.log('  ' + chalk_1.default.green(f.fix));
            console.log();
        }
        if (this.showConfirmFix) {
            console.log(chalk_1.default.bgHex('#ffb86c').black.bold(' CONFIRM FIX ') + chalk_1.default.yellow(` Are you sure you want to modify ${f.file || 'unknown'}? [y/n]`));
            console.log();
        }
        if (this.fixMessage) {
            console.log('  ' + this.fixMessage);
            console.log();
        }
        if (!this.showConfirmFix) {
            const fixLabel = (f.snippet && f.fix) ? chalk_1.default.hex('#4ee6d3').bold(' [f] Apply proposed fix ') : '';
            console.log(chalk_1.default.gray('  Navigation:') + fixLabel + chalk_1.default.gray('   [Esc/b] Back to Category'));
        }
    }
}
exports.InteractiveReporter = InteractiveReporter;
//# sourceMappingURL=interactive.js.map