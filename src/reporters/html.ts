// ─────────────────────────────────────────────
//  ghostproto — HTML Reporter
// ─────────────────────────────────────────────

import fs from 'fs';
import type { AuditReport } from '../core/types';

// Escapes characters for embedding safely inside standard HTML attributes or tags during static header generation
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateHtmlReport(report: AuditReport, outputPath: string): void {
  // Safe serialization of the report for embedding inside <script>
  const serializedReport = JSON.stringify(report).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GhostProto — ${esc(report.project.name)} Audit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #090b11;
    --surface: #101420;
    --surface-hover: #151b2b;
    --surface-card: #121827;
    --border: #1e2638;
    --border-hover: #2e3b54;
    
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --teal: #2dbfad;
    --teal-glow: rgba(45, 191, 173, 0.15);
    --teal-dark: #1b7368;
    
    --critical: #ef4444;
    --high: #f97316;
    --medium: #eab308;
    --low: #3b82f6;
    --info: #64748b;
    --success: #10b981;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    padding-bottom: 4rem;
  }

  a { color: var(--teal); text-decoration: none; transition: color 0.2s; }
  a:hover { color: var(--text-primary); }

  code, pre {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 2rem;
  }
  .logo {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .logo span {
    color: var(--teal);
  }
  .subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-align: right;
  }
  .subtitle strong {
    color: var(--text-secondary);
  }

  /* Bento Grid */
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .bento-card {
    background-color: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .bento-card:hover {
    border-color: var(--border-hover);
  }

  .bento-card h2 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    margin-bottom: 1.25rem;
    font-weight: 700;
  }

  /* Bento Sizes */
  .col-4 { grid-column: span 4; }
  .col-5 { grid-column: span 5; }
  .col-3 { grid-column: span 3; }
  .col-8 { grid-column: span 8; }
  .col-6 { grid-column: span 6; }
  .col-12 { grid-column: span 12; }
  
  @media (max-width: 1024px) {
    .col-4, .col-5, .col-3, .col-8, .col-6 {
      grid-column: span 6;
    }
  }
  @media (max-width: 768px) {
    .col-4, .col-5, .col-3, .col-8, .col-6 {
      grid-column: span 12;
    }
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .subtitle {
      text-align: left;
    }
  }

  /* Score Ring */
  .score-widget {
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .score-ring-container {
    width: 140px;
    height: 140px;
    position: relative;
    margin-bottom: 1rem;
  }
  .score-ring-container svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  .score-ring-container circle {
    fill: none;
    stroke-width: 8;
  }
  .score-ring-container .bg {
    stroke: var(--border);
  }
  .score-ring-container .fg {
    stroke-linecap: round;
    transition: stroke-dashoffset 1s ease-in-out;
  }
  .score-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .score-val {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
  }
  .score-max {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 0.15rem;
  }
  .grade-badge {
    padding: 0.35rem 1.25rem;
    border-radius: 999px;
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  /* Findings breakdown */
  .breakdown-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    height: 100%;
  }
  .breakdown-item {
    background-color: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: background-color 0.2s;
  }
  .breakdown-item:hover {
    background-color: rgba(255,255,255,0.04);
  }
  .breakdown-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .breakdown-val {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
  }
  .breakdown-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  /* Project Info */
  .info-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .info-table tr {
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .info-table tr:last-child {
    border-bottom: none;
  }
  .info-table td {
    padding: 0.55rem 0;
    vertical-align: middle;
  }
  .info-table td:first-child {
    color: var(--text-muted);
    font-weight: 500;
    width: 40%;
  }
  .info-table td:last-child {
    color: var(--text-secondary);
    text-align: right;
    font-weight: 600;
  }
  .lang-tag {
    background-color: var(--border);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: 0.25rem;
    display: inline-block;
  }

  /* Radar Chart Container */
  .radar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }
  .radar-chart {
    max-width: 100%;
    height: 160px;
  }

  /* Agent Trace Timeline */
  .trace-section {
    background-color: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  .trace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  .trace-header.collapsed {
    /* Collapsed state modifier */
  }
  .trace-header h2 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .trace-header-meta {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .trace-chevron {
    transition: transform 0.2s;
  }
  .trace-header.collapsed .trace-chevron {
    transform: rotate(-90deg);
  }
  .trace-content {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .trace-header.collapsed + .trace-content {
    display: none;
  }
  .timeline {
    position: relative;
    padding-left: 1.5rem;
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .timeline-item {
    position: relative;
  }
  .timeline-node {
    position: absolute;
    left: calc(-1.5rem - 5px);
    top: 5px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background-color: var(--border);
    border: 2px solid var(--bg);
  }
  .timeline-node.success { background-color: var(--teal); }
  .timeline-node.error { background-color: var(--critical); }
  .timeline-node.fallback { background-color: var(--medium); }
  
  .timeline-title {
    font-size: 0.875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .timeline-title .time {
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.75rem;
  }
  .timeline-body {
    margin-top: 0.5rem;
    background-color: rgba(0,0,0,0.2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .timeline-body summary {
    cursor: pointer;
    user-select: none;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .timeline-body details pre {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
    max-height: 180px;
    overflow-y: auto;
    font-size: 0.75rem;
    color: #a5b4fc;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Findings & Categories Layout */
  .explorer {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .explorer {
      grid-template-columns: 1fr;
    }
  }

  /* Category List (Sidebar) */
  .category-sidebar {
    background-color: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .sidebar-header {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    padding: 0.5rem;
    font-weight: 700;
  }
  .cat-tab {
    background: none;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.75rem;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  }
  .cat-tab:hover {
    background-color: var(--surface-hover);
    color: var(--text-primary);
  }
  .cat-tab.active {
    background-color: rgba(45, 191, 173, 0.08);
    border-color: rgba(45, 191, 173, 0.2);
    color: var(--text-primary);
  }
  .cat-tab-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
  .cat-tab-icon {
    font-size: 1.125rem;
  }
  .cat-tab-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cat-tab-count {
    background-color: var(--border);
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-weight: 700;
    color: var(--text-muted);
  }
  .cat-tab.active .cat-tab-count {
    background-color: var(--teal);
    color: #090b11;
  }
  .cat-tab-score {
    font-weight: 700;
    font-size: 0.875rem;
  }

  /* Findings Dashboard */
  .findings-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  /* Filters */
  .filter-panel {
    background-color: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .search-wrapper {
    position: relative;
    flex-grow: 1;
    max-width: 400px;
  }
  .search-input {
    width: 100%;
    background-color: rgba(0,0,0,0.2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.5rem 1rem 0.5rem 2.25rem;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .search-input:focus {
    border-color: var(--teal);
  }
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    stroke: var(--text-muted);
  }
  .severity-filters {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .sev-filter-btn {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.2s;
  }
  .sev-filter-btn:hover {
    background-color: var(--surface-hover);
  }
  .sev-filter-btn.active {
    background-color: var(--btn-active-bg);
    border-color: var(--btn-active-border);
    color: var(--btn-active-text);
  }

  /* Findings List */
  .findings-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .no-findings {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
    background-color: var(--surface-card);
    border: 1px dashed var(--border);
    border-radius: 16px;
  }
  .no-findings-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  /* Findings Card */
  .finding-card {
    background-color: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: border-color 0.2s;
  }
  .finding-card:hover {
    border-color: var(--border-hover);
  }
  .finding-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .finding-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .finding-badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .finding-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .finding-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .finding-file-link {
    color: var(--teal);
    font-family: 'Fira Code', monospace;
    font-weight: 500;
  }
  .finding-desc {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  /* Code Block Wrapper */
  .code-panel {
    background-color: #06080d;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .code-panel-header {
    background-color: rgba(255,255,255,0.02);
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
  .code-panel-body {
    padding: 0.75rem;
    overflow-x: auto;
  }
  .code-panel-body pre {
    font-size: 0.75rem;
    color: #e2e8f0;
    white-space: pre;
    line-height: 1.5;
  }

  /* Proposed Fix Panel */
  .fix-panel {
    border-left: 3px solid var(--success);
    background-color: rgba(16, 185, 129, 0.03);
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
  .fix-panel strong {
    color: var(--success);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
  }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    font-family: inherit;
    font-weight: 600;
    transition: color 0.2s;
  }
  .copy-btn:hover {
    color: var(--text-primary);
  }
  .copy-btn.copied {
    color: var(--success);
  }

  /* Footer Section */
  .footer {
    text-align: center;
    padding-top: 3rem;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 4rem;
  }
</style>
</head>
<body>
<div class="container">

  <!-- Main Header -->
  <header class="header">
    <div class="logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--teal)">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Ghost</span>Proto
    </div>
    <div class="subtitle">
      <div>AI-Powered Codebase Audit Report</div>
      <div style="margin-top:0.2rem"><strong>${esc(report.project.name)}</strong> · ${new Date(report.timestamp).toLocaleString()}</div>
    </div>
  </header>

  <!-- Bento grid of stats -->
  <div class="bento-grid">
    <!-- Score widget -->
    <div class="bento-card col-4 score-widget">
      <h2>Overall Score</h2>
      <div class="score-ring-container">
        <svg viewBox="0 0 120 120">
          <circle class="bg" cx="60" cy="60" r="54"/>
          <circle class="fg" id="overall-ring-fg" cx="60" cy="60" r="54" style="stroke:var(--border);stroke-dasharray:339;stroke-dashoffset:339"/>
        </svg>
        <div class="score-text">
          <span class="score-val" id="overall-score-val" style="color:var(--text-muted)">0</span>
          <span class="score-max">/ 100</span>
        </div>
      </div>
      <span class="grade-badge" id="overall-grade-badge">--</span>
    </div>

    <!-- Severity distribution -->
    <div class="bento-card col-5">
      <h2>Findings Distribution</h2>
      <div class="breakdown-list">
        <div class="breakdown-item" style="cursor:pointer" onclick="filterBySeverity('critical')">
          <div class="breakdown-dot" style="background-color:var(--critical)"></div>
          <div>
            <div class="breakdown-val" style="color:var(--critical)">${report.criticalCount}</div>
            <div class="breakdown-label">Critical</div>
          </div>
        </div>
        <div class="breakdown-item" style="cursor:pointer" onclick="filterBySeverity('high')">
          <div class="breakdown-dot" style="background-color:var(--high)"></div>
          <div>
            <div class="breakdown-val" style="color:var(--high)">${report.highCount}</div>
            <div class="breakdown-label">High</div>
          </div>
        </div>
        <div class="breakdown-item" style="cursor:pointer" onclick="filterBySeverity('medium')">
          <div class="breakdown-dot" style="background-color:var(--medium)"></div>
          <div>
            <div class="breakdown-val" style="color:var(--medium)">${report.mediumCount}</div>
            <div class="breakdown-label">Medium</div>
          </div>
        </div>
        <div class="breakdown-item" style="cursor:pointer" onclick="filterBySeverity('low')">
          <div class="breakdown-dot" style="background-color:var(--low)"></div>
          <div>
            <div class="breakdown-val" style="color:var(--low)">${report.lowCount}</div>
            <div class="breakdown-label">Low / Info</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Radar Chart of categories -->
    <div class="bento-card col-3">
      <h2>Category Profiles</h2>
      <div class="radar-container">
        <svg viewBox="0 0 300 300" class="radar-chart" id="radar-chart-svg">
          <!-- Rendered dynamically by script -->
        </svg>
      </div>
    </div>

    <!-- Project info -->
    <div class="bento-card col-12">
      <h2>Project Profile</h2>
      <table class="info-table">
        <tr>
          <td>Directory / Name</td>
          <td><code>${esc(report.project.name)}</code></td>
        </tr>
        <tr>
          <td>Languages Used</td>
          <td>
            ${Object.entries(report.project.languages).map(([l, c]) => `<code>${esc(l)}</code><span class="lang-tag">${c} files</span>`).join(' ')}
          </td>
        </tr>
        ${report.project.frameworks.length ? `
        <tr>
          <td>Frameworks / Libraries</td>
          <td>
            ${report.project.frameworks.map(f => `<code>${esc(f)}</code>`).join(' · ')}
          </td>
        </tr>` : ''}
        <tr>
          <td>Analysis Metrics</td>
          <td>
            Scanned <strong>${report.project.totalFiles.toLocaleString()} files</strong> (${report.project.totalLines.toLocaleString()} LOC) · Tests: <strong>${report.project.hasTests ? 'Detected' : 'None'}</strong>
          </td>
        </tr>
        <tr>
          <td>Audit Engine Type</td>
          <td>
            <span style="color:var(--teal);font-weight:700">
              ${report.agentic ? '✦ Agentic Loop (Proto Engine)' : report.aiPowered ? '✦ One-shot AI (Proto Engine)' : '⚡ Static Analysis'}
            </span>
            · took <strong>${report.durationMs < 1000 ? report.durationMs + ' ms' : (report.durationMs / 1000).toFixed(1) + ' s'}</strong>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Agent Trace timeline (if agentic) -->
  <div id="trace-container"></div>

  <!-- Findings section -->
  <div class="explorer">
    <!-- Sidebar navigation -->
    <aside class="category-sidebar">
      <div class="sidebar-header">Select Category</div>
      <button class="cat-tab active" id="tab-all" onclick="selectCategory('all')">
        <span class="cat-tab-title"><span class="cat-tab-icon">🌐</span> All Categories</span>
        <span class="cat-tab-meta">
          <span class="cat-tab-count">${report.allFindings.length}</span>
        </span>
      </button>
      <div id="category-tabs-list"></div>
    </aside>

    <!-- Findings main workspace -->
    <main class="findings-dashboard">
      <!-- Search & Filters -->
      <section class="filter-panel">
        <div class="search-wrapper">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="search-input" id="search-box" placeholder="Search findings, files, or fixes..." oninput="handleSearch()">
        </div>
        <div class="severity-filters">
          <button class="sev-filter-btn active" id="sev-all" onclick="filterSeverity('all')">All</button>
          <button class="sev-filter-btn" id="sev-critical" style="--btn-active-bg:rgba(239,68,68,0.1);--btn-active-border:rgba(239,68,68,0.3);--btn-active-text:var(--critical)" onclick="filterSeverity('critical')">
            <span style="color:var(--critical)">●</span> Critical
          </button>
          <button class="sev-filter-btn" id="sev-high" style="--btn-active-bg:rgba(249,115,22,0.1);--btn-active-border:rgba(249,115,22,0.3);--btn-active-text:var(--high)" onclick="filterSeverity('high')">
            <span style="color:var(--high)">●</span> High
          </button>
          <button class="sev-filter-btn" id="sev-medium" style="--btn-active-bg:rgba(234,179,8,0.1);--btn-active-border:rgba(234,179,8,0.3);--btn-active-text:var(--medium)" onclick="filterSeverity('medium')">
            <span style="color:var(--medium)">●</span> Medium
          </button>
          <button class="sev-filter-btn" id="sev-low" style="--btn-active-bg:rgba(59,130,246,0.1);--btn-active-border:rgba(59,130,246,0.3);--btn-active-text:var(--low)" onclick="filterSeverity('low')">
            <span style="color:var(--low)">●</span> Low / Info
          </button>
        </div>
      </section>

      <!-- Findings List -->
      <div class="findings-container" id="findings-list-wrapper">
        <!-- Rendered dynamically -->
      </div>
    </main>
  </div>

  <footer class="footer">
    Generated by <a href="https://github.com/AtlasRoX/Ghost-Proto">ghostproto</a> · AI-powered codebase auditor
  </footer>
</div>

<!-- Embedded JSON report data -->
<script>
  const AUDIT_DATA = ${serializedReport};
</script>

<script>
  // Global SPA State
  let currentCategory = 'all';
  let currentSeverity = 'all';
  let searchText = '';

  const CATEGORY_ICONS = {
    security: '🔒',
    quality: '📊',
    performance: '⚡',
    architecture: '🏗️',
    dependencies: '📦',
    testing: '🧪',
    documentation: '📚'
  };

  const SEVERITY_COLORS = {
    critical: 'var(--critical)',
    high: 'var(--high)',
    medium: 'var(--medium)',
    low: 'var(--low)',
    info: 'var(--info)'
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getScoreColor(score) {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--teal)';
    if (score >= 40) return 'var(--medium)';
    return 'var(--critical)';
  }

  // Init Score Circle animation
  function animateScore() {
    const ring = document.getElementById('overall-ring-fg');
    const scoreVal = document.getElementById('overall-score-val');
    const gradeBadge = document.getElementById('overall-grade-badge');
    const score = AUDIT_DATA.overallScore;
    const grade = AUDIT_DATA.overallGrade;
    const color = getScoreColor(score);

    // Score ring stroke-dashoffset animate
    ring.style.stroke = color;
    ring.style.strokeDashoffset = 339 - (339 * score / 100);

    // Number text incremental animate
    let cur = 0;
    const timer = setInterval(() => {
      if (cur >= score) {
        scoreVal.innerText = score;
        clearInterval(timer);
      } else {
        cur += Math.ceil((score - cur) / 10);
        scoreVal.innerText = cur;
      }
    }, 30);
    scoreVal.style.color = color;

    // Grade badge
    gradeBadge.innerText = grade;
    gradeBadge.style.backgroundColor = color + '15';
    gradeBadge.style.color = color;
    gradeBadge.style.border = '1px solid ' + color + '30';
  }

  // Draw Radar Chart SVG
  function drawRadarChart() {
    const svg = document.getElementById('radar-chart-svg');
    const cats = AUDIT_DATA.categories;
    const cx = 150;
    const cy = 150;
    const maxRadius = 90;
    const numPoints = cats.length;

    let gridPolygons = '';
    // Draw concentric rings
    for (let r = 0.2; r <= 1.0; r += 0.2) {
      let pts = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2);
        const x = cx + maxRadius * r * Math.cos(angle);
        const y = cy + maxRadius * r * Math.sin(angle);
        pts.push(x + ',' + y);
      }
      gridPolygons += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="var(--border)" stroke-width="1" />\\n';
    }

    // Draw axis lines
    let axisLines = '';
    let axisLabels = '';
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2);
      const xOuter = cx + maxRadius * Math.cos(angle);
      const yOuter = cy + maxRadius * Math.sin(angle);
      axisLines += '<line x1="' + cx + '" y1="' + cy + '" x2="' + xOuter + '" y2="' + yOuter + '" stroke="var(--border)" stroke-width="1" />\\n';

      // Label positioning offset
      const labelX = cx + (maxRadius + 20) * Math.cos(angle);
      const labelY = cy + (maxRadius + 12) * Math.sin(angle);
      const catName = cats[i].category.charAt(0).toUpperCase() + cats[i].category.slice(1);
      const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
      axisLabels += '<text x="' + labelX + '" y="' + labelY + '" fill="var(--text-muted)" font-size="8" font-weight="700" text-anchor="' + textAnchor + '">' + catName + '</text>\\n';
    }

    // Draw the actual data shape
    let dataPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2);
      const val = cats[i].score / 100;
      const x = cx + maxRadius * val * Math.cos(angle);
      const y = cy + maxRadius * val * Math.sin(angle);
      dataPoints.push(x + ',' + y);
    }
    const dataShape = '<polygon points="' + dataPoints.join(' ') + '" fill="rgba(45, 191, 173, 0.25)" stroke="var(--teal)" stroke-width="2" />\\n';

    svg.innerHTML = gridPolygons + axisLines + dataShape + axisLabels;
  }

  // Draw Category Sidebar tabs
  function drawCategorySidebar() {
    const list = document.getElementById('category-tabs-list');
    let html = '';
    
    AUDIT_DATA.categories.forEach(cat => {
      const icon = CATEGORY_ICONS[cat.category] || '📁';
      const scoreColor = getScoreColor(cat.score);
      const count = cat.findings.length;
      const label = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);

      html += '<button class="cat-tab" id="tab-' + cat.category + '" data-cat="' + cat.category + '">'
        + '<span class="cat-tab-title">'
        + '<span class="cat-tab-icon">' + icon + '</span>'
        + label
        + '</span>'
        + '<span class="cat-tab-meta">'
        + (count > 0 ? '<span class="cat-tab-count">' + count + '</span>' : '')
        + '<span class="cat-tab-score" style="color:' + scoreColor + '">' + cat.score + '</span>'
        + '</span>'
        + '</button>';
    });

    list.innerHTML = html;
  }

  // Draw Agent Trace timeline if available
  function drawAgentTrace() {
    const container = document.getElementById('trace-container');
    if (!AUDIT_DATA.agentTrace) return;

    const trace = AUDIT_DATA.agentTrace;
    const summary = trace.summary;
    const stopColor = summary.stopReason === 'completed' ? 'var(--success)' : 'var(--critical)';

    const toolUsageHtml = Object.entries(summary.toolUsage)
      .sort((a,b) => b[1] - a[1])
      .map(entry => '<span class="tool-chip"><code>' + escapeHtml(entry[0]) + '</code> · ' + entry[1] + '</span>')
      .join('');

    const timelineHtml = trace.calls.map((call, idx) => {
      const isErr = call.isError;
      const statusClass = isErr ? 'error' : 'success';
      const displayDuration = call.durationMs < 1000 ? call.durationMs + 'ms' : (call.durationMs / 1000).toFixed(1) + 's';
      const formattedInput = escapeHtml(JSON.stringify(call.input, null, 2));
      const formattedOutput = escapeHtml(call.outputPreview);

      return '<div class="timeline-item">'
        + '<div class="timeline-node ' + statusClass + '"></div>'
        + '<div class="timeline-title">'
        + '<code>' + escapeHtml(call.name) + '</code>'
        + '<span class="time">' + displayDuration + '</span>'
        + '</div>'
        + '<div class="timeline-body">'
        + '<details>'
        + '<summary>Arguments & Preview (' + (idx + 1) + '/' + trace.calls.length + ')</summary>'
        + '<div style="margin-top:0.5rem;font-weight:600;color:var(--text-muted);font-size:0.7rem">ARGUMENTS</div>'
        + '<pre style="margin-top:0.25rem;border-top:none;padding-top:0;color:#94a3b8">' + formattedInput + '</pre>'
        + '<div style="margin-top:0.5rem;font-weight:600;color:var(--text-muted);font-size:0.7rem">OUTPUT PREVIEW</div>'
        + '<pre>' + formattedOutput + '</pre>'
        + '</details>'
        + '</div>'
        + '</div>';
    }).join('');

    container.innerHTML = '<section class="trace-section">'
      + '<div class="trace-header collapsed" id="trace-collapsible-header" onclick="toggleTrace()">'
      + '<h2>'
      + '<svg class="trace-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
      + '<polyline points="6 9 12 15 18 9"/>'
      + '</svg>'
      + ' 🧭 Agentic Audit Trace'
      + '</h2>'
      + '<div class="trace-header-meta">'
      + '<span>Model: <code>' + escapeHtml(trace.model) + '</code></span>'
      + '<span>Turns: <strong>' + summary.turns + ' / ' + trace.maxTurns + '</strong></span>'
      + '<span>Stop reason: <strong style="color:' + stopColor + '">' + escapeHtml(summary.stopReason) + '</strong></span>'
      + '</div>'
      + '</div>'
      + '<div class="trace-content" style="display:none" id="trace-collapsible-content">'
      + '<table class="info-table" style="max-width:500px;margin-bottom:1rem">'
      + '<tr><td>API Model Target</td><td><code>' + escapeHtml(trace.model) + '</code></td></tr>'
      + '<tr><td>Total Token Expense</td><td>'
      + '<strong>' + summary.inputTokens.toLocaleString() + '</strong> in · '
      + '<strong>' + summary.outputTokens.toLocaleString() + '</strong> out · '
      + '<strong>' + summary.cacheReadTokens.toLocaleString() + '</strong> cache read'
      + '</td></tr>'
      + (summary.stopDetail ? '<tr><td>Termination Detail</td><td><code style="color:var(--critical)">' + escapeHtml(summary.stopDetail) + '</code></td></tr>' : '')
      + '</table>'
      + '<div class="timeline">' + timelineHtml + '</div>'
      + (toolUsageHtml ? '<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">'
        + '<div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:0.75rem;font-weight:700">Tool execution summary</div>'
        + '<div class="tool-usage">' + toolUsageHtml + '</div>'
        + '</div>' : '')
      + '</div>'
      + '</section>';
  }

  function toggleTrace() {
    const header = document.getElementById('trace-collapsible-header');
    const content = document.getElementById('trace-collapsible-content');
    if (header.classList.contains('collapsed')) {
      header.classList.remove('collapsed');
      content.style.display = 'block';
    } else {
      header.classList.add('collapsed');
      content.style.display = 'none';
    }
  }

  // Findings filter & search
  function getFilteredFindings() {
    let findings = [];
    
    if (currentCategory === 'all') {
      findings = AUDIT_DATA.allFindings;
    } else {
      const cat = AUDIT_DATA.categories.find(c => c.category === currentCategory);
      findings = cat ? cat.findings : [];
    }

    return findings.filter(f => {
      // Severity check
      if (currentSeverity !== 'all') {
        const matches = {
          critical: f.severity === 'critical',
          high: f.severity === 'high',
          medium: f.severity === 'medium',
          low: f.severity === 'low' || f.severity === 'info'
        };
        if (!matches[currentSeverity]) return false;
      }

      // Search text check
      if (searchText) {
        const search = searchText.toLowerCase();
        const inTitle = (f.title || '').toLowerCase().includes(search);
        const inDesc = (f.description || '').toLowerCase().includes(search);
        const inFile = (f.file || '').toLowerCase().includes(search);
        const inFix = (f.fix || '').toLowerCase().includes(search);
        return inTitle || inDesc || inFile || inFix;
      }

      return true;
    });
  }

  function copyFix(index) {
    const filtered = getFilteredFindings();
    const finding = filtered[index];
    if (!finding || !finding.fix) return;

    navigator.clipboard.writeText(finding.fix).then(() => {
      const btn = document.getElementById('copy-btn-' + index);
      btn.innerText = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerText = 'Copy Fix';
        btn.classList.remove('copied');
      }, 2000);
    });
  }

  // Render Findings
  function renderFindings() {
    const list = document.getElementById('findings-list-wrapper');
    const filtered = getFilteredFindings();

    if (filtered.length === 0) {
      list.innerHTML = '<div class="no-findings">'
        + '<div class="no-findings-icon">🎉</div>'
        + '<h3>No findings match your filter</h3>'
        + '<p style="font-size:0.875rem;margin-top:0.25rem">Clear filters or try searching for another term.</p>'
        + '</div>';
      return;
    }

    const html = filtered.map((f, index) => {
      const color = SEVERITY_COLORS[f.severity] || 'var(--text-muted)';
      const cleanDesc = escapeHtml(f.description);
      const cleanTitle = escapeHtml(f.title);
      const cleanFile = escapeHtml(f.file);
      const cleanFix = escapeHtml(f.fix);

      return '<div class="finding-card">'
        + '<div class="finding-card-header">'
        + '<div class="finding-title-row">'
        + '<span class="finding-badge" style="background-color:' + color + '15;color:' + color + ';border:1px solid ' + color + '30">' + f.severity + '</span>'
        + '<h3 class="finding-title">' + cleanTitle + '</h3>'
        + '</div>'
        + '<span style="font-size:0.75rem;font-weight:700;color:var(--text-muted)">' + f.id + '</span>'
        + '</div>'
        + (f.file ? '<div class="finding-meta">'
          + '<span>File: <span class="finding-file-link">' + cleanFile + (f.line ? ':' + f.line : '') + '</span></span>'
          + '</div>' : '')
        + '<p class="finding-desc">' + cleanDesc + '</p>'
        + (f.snippet ? '<div class="code-panel">'
          + '<div class="code-panel-header">'
          + '<span>' + cleanFile.split('/').pop() + (f.line ? ' (Line ' + f.line + ')' : '') + '</span>'
          + '<code>Code Context</code>'
          + '</div>'
          + '<div class="code-panel-body">'
          + '<pre><code>' + escapeHtml(f.snippet) + '</code></pre>'
          + '</div>'
          + '</div>' : '')
        + (f.fix ? '<div class="fix-panel">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">'
          + '<strong>'
          + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
          + '<polyline points="20 6 9 17 4 12"/>'
          + '</svg>'
          + ' Proposed Fix'
          + '</strong>'
          + '<button class="copy-btn" id="copy-btn-' + index + '" onclick="copyFix(' + index + ')">Copy Fix</button>'
          + '</div>'
          + '<p style="color:var(--text-secondary);font-size:0.825rem">' + cleanFix + '</p>'
          + '</div>' : '')
        + '</div>';
    }).join('');

    list.innerHTML = html;
  }

  // Delegated click handler for dynamically-rendered category tabs
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-cat]');
    if (btn) { selectCategory(btn.dataset.cat); }
  });

  // Interactive events
  function selectCategory(cat) {
    // Update active tab styles
    document.querySelectorAll('.cat-tab').forEach(btn => btn.classList.remove('active'));
    const target = document.getElementById('tab-' + cat);
    if (target) target.classList.add('active');
    
    currentCategory = cat;
    renderFindings();
  }

  function filterSeverity(sev) {
    document.querySelectorAll('.sev-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('sev-' + sev).classList.add('active');

    currentSeverity = sev;
    renderFindings();
  }

  function filterBySeverity(sev) {
    filterSeverity(sev);
    const scrollTarget = document.querySelector('.explorer');
    scrollTarget.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSearch() {
    searchText = document.getElementById('search-box').value;
    renderFindings();
  }

  // Document Ready Setup
  window.addEventListener('DOMContentLoaded', () => {
    animateScore();
    drawRadarChart();
    drawCategorySidebar();
    drawAgentTrace();
    renderFindings();
  });
</script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
}
