// ─────────────────────────────────────────────
//  ghostproto — HTML Reporter  (v3 — monochrome + logo)
// ─────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { AuditReport } from '../core/types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Resolve logo as an inline base64 data-URI, fallback to empty string */
function loadLogoDataUri(): string {
  try {
    // Walk up from dist/ to project root, look for assets/logo.png
    const candidates = [
      path.resolve(__dirname, '../../assets/logo.png'),
      path.resolve(__dirname, '../assets/logo.png'),
      path.resolve(process.cwd(), 'assets/logo.png'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const b64 = fs.readFileSync(p).toString('base64');
        return `data:image/png;base64,${b64}`;
      }
    }
  } catch { /* ignored */ }
  return '';
}

export function generateHtmlReport(report: AuditReport, outputPath: string): void {
  const serializedReport = JSON.stringify(report).replace(/</g, '\\u003c');
  const logoDataUri = loadLogoDataUri();
  const logoHtml = logoDataUri
    ? `<img src="${logoDataUri}" alt="GhostProto" class="logo-img">`
    : `<span class="logo-text">Ghost<span>Proto</span></span>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GhostProto — ${esc(report.project.name)} Audit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  /* ── Reset & base ─────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    /* Monochrome palette */
    --bg:            #0a0a0a;
    --surface:       #111111;
    --surface-2:     #171717;
    --border:        #222222;
    --border-2:      #2e2e2e;

    --text-1:        #f5f5f5;
    --text-2:        #a3a3a3;
    --text-3:        #6b6b6b;
    --text-inv:      #0a0a0a;

    /* Severity indicators — the ONLY colours */
    --sev-critical:  #ef4444;
    --sev-high:      #f97316;
    --sev-medium:    #eab308;
    --sev-low:       #3b82f6;
    --sev-info:      #6b6b6b;
    --sev-success:   #22c55e;

    /* Accent used only for active states */
    --accent:        #f5f5f5;
    --accent-inv:    #0a0a0a;

    --radius-sm:     6px;
    --radius-md:     10px;
    --radius-lg:     14px;
    --radius-xl:     18px;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text-1);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    /* Prevent horizontal scroll at all costs */
    overflow-x: hidden;
  }

  code, pre, .mono {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
  }

  a { color: var(--text-2); text-decoration: none; }
  a:hover { color: var(--text-1); }

  /* ── Layout shell ─────────────────────────────────── */
  .page {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .wrap {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Top nav / header ────────────────────────────── */
  .topbar {
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .topbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    gap: 16px;
    padding: 0 24px;
    max-width: 1280px;
    margin: 0 auto;
    min-width: 0;
  }
  .logo-img {
    height: 28px;
    width: auto;
    display: block;
    object-fit: contain;
  }
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text-1);
  }
  .logo-text span { color: var(--text-3); }
  .topbar-meta {
    font-size: 12px;
    color: var(--text-3);
    text-align: right;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .topbar-meta strong { color: var(--text-2); font-weight: 600; }

  /* ── Hero stats strip ────────────────────────────── */
  .hero {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 32px 0;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .stat-cell {
    background: var(--surface);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: default;
    transition: background 0.15s;
  }
  .stat-cell[data-clickable] { cursor: pointer; }
  .stat-cell[data-clickable]:hover { background: var(--surface-2); }
  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-3);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .stat-value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-1);
    letter-spacing: -1px;
  }
  .stat-sub {
    font-size: 12px;
    color: var(--text-3);
    font-weight: 500;
  }

  /* ── Info row (score + project info) ─────────────── */
  .info-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-top: 20px;
  }
  @media (max-width: 680px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .info-row { grid-template-columns: 1fr; }
  }
  .score-cell {
    background: var(--surface);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .score-ring-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  .score-ring-wrap svg {
    width: 120px;
    height: 120px;
    transform: rotate(-90deg);
  }
  .score-ring-wrap circle {
    fill: none;
    stroke-width: 7;
  }
  .score-ring-wrap .ring-bg { stroke: var(--border-2); }
  .score-ring-wrap .ring-fg {
    stroke-linecap: round;
    transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);
  }
  .score-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .score-num {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }
  .score-denom {
    font-size: 11px;
    color: var(--text-3);
    font-weight: 500;
  }
  .grade-pill {
    font-size: 13px;
    font-weight: 700;
    padding: 4px 16px;
    border-radius: 999px;
    border: 1px solid var(--border-2);
    color: var(--text-2);
    background: var(--surface-2);
    letter-spacing: 0.5px;
  }
  .score-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-3);
  }

  .project-cell {
    background: var(--surface);
    padding: 24px 28px;
  }
  .project-cell h2 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-3);
    margin-bottom: 16px;
  }
  .info-rows-table {
    width: 100%;
    border-collapse: collapse;
  }
  .info-rows-table tr {
    border-bottom: 1px solid var(--border);
  }
  .info-rows-table tr:last-child { border-bottom: none; }
  .info-rows-table td {
    padding: 10px 0;
    vertical-align: top;
    font-size: 13px;
  }
  .info-rows-table td:first-child {
    color: var(--text-3);
    font-weight: 500;
    width: 160px;
    padding-right: 16px;
    white-space: nowrap;
  }
  .info-rows-table td:last-child {
    color: var(--text-2);
    min-width: 0;
    word-break: break-word;
  }
  .lang-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
    margin: 2px 2px 2px 0;
  }
  .lang-chip sub { font-size: 10px; color: var(--text-3); }

  /* ── Main content body ───────────────────────────── */
  .main-content {
    padding: 24px 0 64px;
  }
  .content-grid {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 820px) {
    .content-grid { grid-template-columns: 1fr; }
  }

  /* ── Agent Trace (if present) ─────────────────────── */
  .trace-block {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    margin-bottom: 20px;
    overflow: hidden;
  }
  .trace-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    cursor: pointer;
    user-select: none;
    gap: 12px;
  }
  .trace-toggle:hover { background: var(--surface-2); }
  .trace-toggle-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-2);
    min-width: 0;
  }
  .trace-toggle-right {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: var(--text-3);
    flex-shrink: 0;
  }
  .trace-toggle-right strong { color: var(--text-2); }
  .chevron {
    width: 16px;
    height: 16px;
    stroke: var(--text-3);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .trace-block.open .chevron { transform: rotate(180deg); }
  .trace-body {
    display: none;
    border-top: 1px solid var(--border);
    padding: 20px;
  }
  .trace-block.open .trace-body { display: block; }
  .timeline {
    padding-left: 20px;
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .tl-item { position: relative; }
  .tl-dot {
    position: absolute;
    left: calc(-20px - 4px);
    top: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-2);
    border: 2px solid var(--bg);
  }
  .tl-dot.ok   { background: var(--sev-success); }
  .tl-dot.fail { background: var(--sev-critical); }
  .tl-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .tl-dur {
    font-size: 11px;
    color: var(--text-3);
    font-weight: 400;
  }
  .tl-details {
    margin-top: 6px;
    font-size: 12px;
  }
  .tool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .tool-chip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
    font-size: 11px;
    color: var(--text-3);
  }

  /* ── Category sidebar ─────────────────────────────── */
  .cat-sidebar {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    /* Sticky within scroll */
    position: sticky;
    top: 72px;
  }
  .cat-sidebar-hdr {
    padding: 12px 16px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-3);
    border-bottom: 1px solid var(--border);
  }
  .cat-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 11px 16px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    color: var(--text-2);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    gap: 8px;
    transition: background 0.1s, color 0.1s;
  }
  .cat-btn:last-child { border-bottom: none; }
  .cat-btn:hover { background: var(--surface-2); color: var(--text-1); }
  .cat-btn.active {
    background: var(--text-1);
    color: var(--text-inv);
  }
  .cat-btn-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .cat-btn-icon { font-size: 14px; }
  .cat-btn-name { font-weight: 600; }
  .cat-btn-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .cat-count {
    font-size: 11px;
    font-weight: 700;
    background: rgba(255,255,255,0.07);
    padding: 1px 6px;
    border-radius: 999px;
    color: var(--text-3);
  }
  .cat-btn.active .cat-count {
    background: rgba(0,0,0,0.15);
    color: var(--text-inv);
  }
  .cat-score {
    font-size: 12px;
    font-weight: 700;
  }

  /* ── Findings panel ──────────────────────────────── */
  .findings-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  /* Filter bar */
  .filter-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 12px 14px;
  }
  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 160px;
    max-width: 340px;
  }
  .search-ico {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    stroke: var(--text-3);
    pointer-events: none;
  }
  .search-inp {
    width: 100%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 7px 10px 7px 30px;
    color: var(--text-1);
    font-family: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }
  .search-inp:focus { border-color: var(--border-2); }
  .search-inp::placeholder { color: var(--text-3); }
  .sev-btns {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .sev-btn {
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-3);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .sev-btn:hover { border-color: var(--border-2); color: var(--text-2); }
  .sev-btn.active {
    border-color: var(--border-2);
    background: var(--surface-2);
    color: var(--text-1);
  }
  .sev-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* Finding cards */
  .findings-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .finding-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color 0.15s;
    min-width: 0;
  }
  .finding-card:hover { border-color: var(--border-2); }

  .finding-card-top {
    padding: 16px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .finding-row1 {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .sev-badge {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 2px 7px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .finding-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-1);
    min-width: 0;
    word-break: break-word;
  }
  .finding-id {
    margin-left: auto;
    font-size: 11px;
    color: var(--text-3);
    font-weight: 500;
    flex-shrink: 0;
  }
  .finding-file {
    font-size: 12px;
    color: var(--text-3);
    font-family: 'Fira Code', monospace;
    word-break: break-all;
    min-width: 0;
  }
  .finding-desc {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.55;
    min-width: 0;
    word-break: break-word;
  }

  /* Code panel */
  .code-block {
    border-top: 1px solid var(--border);
    background: #050505;
    overflow: hidden;
    min-width: 0;
  }
  .code-block-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    color: var(--text-3);
    background: rgba(255,255,255,0.02);
    gap: 8px;
  }
  .code-block-body {
    padding: 12px 14px;
    overflow-x: auto;
    max-width: 100%;
  }
  .code-block-body pre {
    font-size: 12px;
    color: #c9d1d9;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
    margin: 0;
  }

  /* Fix panel */
  .fix-block {
    border-top: 1px solid var(--border);
    padding: 14px 18px;
    background: rgba(34, 197, 94, 0.03);
    border-left: 3px solid var(--sev-success);
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .fix-block-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .fix-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--sev-success);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .copy-btn {
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-3);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .copy-btn:hover { color: var(--text-1); border-color: var(--border-2); }
  .copy-btn.copied { color: var(--sev-success); border-color: var(--sev-success); }
  .fix-text {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.55;
    word-break: break-word;
    min-width: 0;
  }

  /* Empty state */
  .empty-state {
    padding: 60px 24px;
    text-align: center;
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-3);
  }
  .empty-state h3 { font-size: 16px; color: var(--text-2); margin-bottom: 6px; }

  /* ── Footer ──────────────────────────────────────── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 20px 24px;
    text-align: center;
    font-size: 12px;
    color: var(--text-3);
  }
  .footer a { color: var(--text-3); }
  .footer a:hover { color: var(--text-2); }
</style>
</head>
<body>
<div class="page">

  <!-- ── Top nav ───────────────────────────────────── -->
  <header class="topbar">
    <div class="topbar-inner">
      ${logoHtml}
      <div class="topbar-meta">
        AI-Powered Codebase Audit &nbsp;·&nbsp;
        <strong>${esc(report.project.name)}</strong>
        &nbsp;·&nbsp;
        ${new Date(report.timestamp).toLocaleString()}
      </div>
    </div>
  </header>

  <!-- ── Hero stats ─────────────────────────────────── -->
  <section class="hero">
    <div class="wrap">
      <!-- Severity distribution tiles -->
      <div class="stats-grid">
        <div class="stat-cell" data-clickable onclick="filterSeverity('critical')">
          <div class="stat-label">
            <span class="stat-dot" style="background:var(--sev-critical)"></span>
            Critical
          </div>
          <div class="stat-value" style="color:var(--sev-critical)">${report.criticalCount}</div>
          <div class="stat-sub">findings requiring immediate action</div>
        </div>
        <div class="stat-cell" data-clickable onclick="filterSeverity('high')">
          <div class="stat-label">
            <span class="stat-dot" style="background:var(--sev-high)"></span>
            High
          </div>
          <div class="stat-value" style="color:var(--sev-high)">${report.highCount}</div>
          <div class="stat-sub">significant issues to address</div>
        </div>
        <div class="stat-cell" data-clickable onclick="filterSeverity('medium')">
          <div class="stat-label">
            <span class="stat-dot" style="background:var(--sev-medium)"></span>
            Medium
          </div>
          <div class="stat-value" style="color:var(--sev-medium)">${report.mediumCount}</div>
          <div class="stat-sub">moderate risk items</div>
        </div>
        <div class="stat-cell" data-clickable onclick="filterSeverity('low')">
          <div class="stat-label">
            <span class="stat-dot" style="background:var(--sev-low)"></span>
            Low / Info
          </div>
          <div class="stat-value" style="color:var(--sev-low)">${report.lowCount}</div>
          <div class="stat-sub">informational findings</div>
        </div>
      </div>

      <!-- Score ring + project info -->
      <div class="info-row">
        <!-- Score -->
        <div class="score-cell">
          <div class="score-label">Overall Score</div>
          <div class="score-ring-wrap">
            <svg viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="52"/>
              <circle class="ring-fg" id="score-ring" cx="60" cy="60" r="52"
                style="stroke:var(--border-2);stroke-dasharray:327;stroke-dashoffset:327"/>
            </svg>
            <div class="score-inner">
              <span class="score-num" id="score-num" style="color:var(--text-3)">0</span>
              <span class="score-denom">/ 100</span>
            </div>
          </div>
          <span class="grade-pill" id="grade-pill">--</span>
        </div>

        <!-- Project info table -->
        <div class="project-cell">
          <h2>Project Profile</h2>
          <table class="info-rows-table">
            <tr>
              <td>Directory</td>
              <td><code>${esc(report.project.name)}</code></td>
            </tr>
            <tr>
              <td>Languages</td>
              <td>
                ${Object.entries(report.project.languages).map(([l, c]) =>
                  `<span class="lang-chip">${esc(l)}<sub>${c} files</sub></span>`
                ).join('')}
              </td>
            </tr>
            ${report.project.frameworks.length ? `<tr>
              <td>Frameworks</td>
              <td>${report.project.frameworks.map(f => `<span class="lang-chip">${esc(f)}</span>`).join('')}</td>
            </tr>` : ''}
            <tr>
              <td>Scanned</td>
              <td>
                <strong>${report.project.totalFiles.toLocaleString()}</strong> files
                &nbsp;·&nbsp;
                <strong>${report.project.totalLines.toLocaleString()}</strong> LOC
                &nbsp;·&nbsp;
                Tests: <strong>${report.project.hasTests ? 'Detected' : 'None'}</strong>
              </td>
            </tr>
            <tr>
              <td>Engine</td>
              <td>
                ${report.agentic
                  ? '✦ Agentic Loop (Proto Engine)'
                  : report.aiPowered
                    ? '✦ One-shot AI (Proto Engine)'
                    : '⚡ Static Analysis'}
                &nbsp;·&nbsp;
                <strong>${report.durationMs < 1000 ? report.durationMs + ' ms' : (report.durationMs / 1000).toFixed(1) + ' s'}</strong>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Main body ──────────────────────────────────── -->
  <main class="main-content">
    <div class="wrap">

      <!-- Agent trace (conditionally rendered) -->
      <div id="trace-container"></div>

      <!-- Two-column explorer -->
      <div class="content-grid">

        <!-- Category sidebar -->
        <aside class="cat-sidebar" id="cat-sidebar">
          <div class="cat-sidebar-hdr">Categories</div>
          <button class="cat-btn active" id="tab-all" onclick="selectCategory('all')">
            <span class="cat-btn-left">
              <span class="cat-btn-icon">◈</span>
              <span class="cat-btn-name">All</span>
            </span>
            <span class="cat-btn-right">
              <span class="cat-count">${report.allFindings.length}</span>
            </span>
          </button>
          <div id="cat-tabs"></div>
        </aside>

        <!-- Findings panel -->
        <div class="findings-panel">

          <!-- Filter bar -->
          <div class="filter-bar">
            <div class="search-wrap">
              <svg class="search-ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-inp" id="search-box"
                placeholder="Search findings, files, fixes…" oninput="handleSearch()">
            </div>
            <div class="sev-btns">
              <button class="sev-btn active" id="sev-all" onclick="filterSeverity('all')">All</button>
              <button class="sev-btn" id="sev-critical" onclick="filterSeverity('critical')">
                <span class="sev-dot" style="background:var(--sev-critical)"></span>Critical
              </button>
              <button class="sev-btn" id="sev-high" onclick="filterSeverity('high')">
                <span class="sev-dot" style="background:var(--sev-high)"></span>High
              </button>
              <button class="sev-btn" id="sev-medium" onclick="filterSeverity('medium')">
                <span class="sev-dot" style="background:var(--sev-medium)"></span>Medium
              </button>
              <button class="sev-btn" id="sev-low" onclick="filterSeverity('low')">
                <span class="sev-dot" style="background:var(--sev-low)"></span>Low
              </button>
            </div>
          </div>

          <!-- Findings list -->
          <div class="findings-list" id="findings-list"></div>

        </div>
      </div>
    </div>
  </main>

  <!-- ── Footer ─────────────────────────────────────── -->
  <footer class="footer">
    Generated by <a href="https://github.com/AtlasRoX/Ghost-Proto" target="_blank">ghostproto</a>
    &nbsp;·&nbsp; AI-powered codebase auditor
  </footer>

</div><!-- /page -->

<script>const AUDIT_DATA = ${serializedReport};</script>
<script>
  'use strict';

  // ── State ──────────────────────────────────────────
  let CAT   = 'all';
  let SEV   = 'all';
  let QUERY = '';

  const SEV_COLORS = {
    critical : 'var(--sev-critical)',
    high     : 'var(--sev-high)',
    medium   : 'var(--sev-medium)',
    low      : 'var(--sev-low)',
    info     : 'var(--sev-info)',
  };

  const CAT_ICONS = {
    security     : '🔒',
    quality      : '📊',
    performance  : '⚡',
    architecture : '🏗️',
    dependencies : '📦',
    testing      : '🧪',
    documentation: '📚',
  };

  // ── Helpers ────────────────────────────────────────
  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function scoreColor(s) {
    if (s >= 80) return 'var(--sev-success)';
    if (s >= 60) return 'var(--text-2)';
    if (s >= 40) return 'var(--sev-medium)';
    return 'var(--sev-critical)';
  }

  // ── Score ring animation ───────────────────────────
  function animateScore() {
    const ring   = document.getElementById('score-ring');
    const numEl  = document.getElementById('score-num');
    const grade  = document.getElementById('grade-pill');
    const score  = AUDIT_DATA.overallScore;
    const color  = scoreColor(score);
    const circ   = 327; // 2π × r(52)

    ring.style.stroke            = color;
    ring.style.strokeDashoffset  = circ - (circ * score / 100);
    numEl.style.color            = color;

    let cur = 0;
    const iv = setInterval(() => {
      cur += Math.ceil((score - cur) / 8) || 1;
      if (cur >= score) { cur = score; clearInterval(iv); }
      numEl.textContent = cur;
    }, 28);

    grade.textContent              = AUDIT_DATA.overallGrade || '--';
    grade.style.borderColor        = color + '40';
    grade.style.color              = color;
  }

  // ── Category sidebar ───────────────────────────────
  function buildSidebar() {
    const wrap = document.getElementById('cat-tabs');
    let html = '';
    AUDIT_DATA.categories.forEach(cat => {
      const icon  = CAT_ICONS[cat.category] || '▸';
      const color = scoreColor(cat.score);
      const label = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
      html += '<button class="cat-btn" id="tab-' + cat.category + '" data-cat="' + cat.category + '">'
        + '<span class="cat-btn-left">'
        + '<span class="cat-btn-icon">' + icon + '</span>'
        + '<span class="cat-btn-name">' + label + '</span>'
        + '</span>'
        + '<span class="cat-btn-right">'
        + (cat.findings.length ? '<span class="cat-count">' + cat.findings.length + '</span>' : '')
        + '<span class="cat-score" style="color:' + color + '">' + cat.score + '</span>'
        + '</span>'
        + '</button>';
    });
    wrap.innerHTML = html;
  }

  // Delegated handler for data-cat buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) selectCategory(btn.dataset.cat);
  });

  // ── Agent trace ────────────────────────────────────
  function buildTrace() {
    const container = document.getElementById('trace-container');
    if (!AUDIT_DATA.agentTrace) return;
    const trace   = AUDIT_DATA.agentTrace;
    const summary = trace.summary;
    const stopCol = summary.stopReason === 'completed' ? 'var(--sev-success)' : 'var(--sev-critical)';

    const timelineHtml = trace.calls.map((call, i) => {
      const cls = call.isError ? 'fail' : 'ok';
      const dur = call.durationMs < 1000
        ? call.durationMs + 'ms'
        : (call.durationMs / 1000).toFixed(1) + 's';
      return '<div class="tl-item">'
        + '<div class="tl-dot ' + cls + '"></div>'
        + '<div class="tl-title"><code>' + esc(call.name) + '</code>'
        + '<span class="tl-dur">' + dur + '</span></div>'
        + '<details class="tl-details"><summary style="cursor:pointer;font-size:11px;color:var(--text-3)">Args &amp; output (' + (i+1) + '/' + trace.calls.length + ')</summary>'
        + '<pre style="margin-top:6px;font-size:11px;color:var(--text-3);white-space:pre-wrap;word-break:break-all">'
        + esc(JSON.stringify(call.input,null,2))
        + '\\n\\n--- OUTPUT ---\\n'
        + esc(call.outputPreview)
        + '</pre></details></div>';
    }).join('');

    const toolChips = Object.entries(summary.toolUsage)
      .sort((a,b) => b[1]-a[1])
      .map(([n,c]) => '<span class="tool-chip"><code>' + esc(n) + '</code> · ' + c + '</span>')
      .join('');

    container.innerHTML = '<div class="trace-block" id="trace-block">'
      + '<div class="trace-toggle" onclick="toggleTrace()">'
      + '<div class="trace-toggle-left">'
      + '<svg class="chevron" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
      + '🧭 Agentic Audit Trace'
      + '</div>'
      + '<div class="trace-toggle-right">'
      + '<span>Model: <strong>' + esc(trace.model) + '</strong></span>'
      + '<span>Turns: <strong>' + summary.turns + '/' + trace.maxTurns + '</strong></span>'
      + '<span>Stop: <strong style="color:' + stopCol + '">' + esc(summary.stopReason) + '</strong></span>'
      + '</div></div>'
      + '<div class="trace-body">'
      + '<div class="timeline" style="margin-bottom:12px">' + timelineHtml + '</div>'
      + (toolChips ? '<div class="tool-chips">' + toolChips + '</div>' : '')
      + '</div></div>';
  }

  function toggleTrace() {
    document.getElementById('trace-block').classList.toggle('open');
  }

  // ── Filtering ──────────────────────────────────────
  function getFindings() {
    let items = CAT === 'all'
      ? AUDIT_DATA.allFindings
      : (AUDIT_DATA.categories.find(c => c.category === CAT) || {findings:[]}).findings;

    if (SEV !== 'all') {
      items = items.filter(f => {
        if (SEV === 'low') return f.severity === 'low' || f.severity === 'info';
        return f.severity === SEV;
      });
    }

    if (QUERY) {
      const q = QUERY.toLowerCase();
      items = items.filter(f =>
        (f.title||'').toLowerCase().includes(q) ||
        (f.description||'').toLowerCase().includes(q) ||
        (f.file||'').toLowerCase().includes(q) ||
        (f.fix||'').toLowerCase().includes(q)
      );
    }
    return items;
  }

  function renderFindings() {
    const list    = document.getElementById('findings-list');
    const items   = getFindings();

    if (!items.length) {
      list.innerHTML = '<div class="empty-state"><h3>No findings match your filter</h3><p>Clear filters or try a different search term.</p></div>';
      return;
    }

    list.innerHTML = items.map((f, i) => {
      const col  = SEV_COLORS[f.severity] || 'var(--sev-info)';
      const file = esc(f.file || '');
      const line = f.line ? ':' + f.line : '';
      const fname = (f.file || '').split('/').pop();

      return '<div class="finding-card">'
        + '<div class="finding-card-top">'
        + '<div class="finding-row1">'
        + '<span class="sev-badge" style="background:' + col + '15;color:' + col + ';border:1px solid ' + col + '30">' + esc(f.severity) + '</span>'
        + '<span class="finding-title">' + esc(f.title) + '</span>'
        + '<span class="finding-id">' + esc(f.id) + '</span>'
        + '</div>'
        + (f.file ? '<div class="finding-file">File: ' + file + line + '</div>' : '')
        + '<div class="finding-desc">' + esc(f.description) + '</div>'
        + '</div>'
        + (f.snippet ? '<div class="code-block">'
          + '<div class="code-block-hdr"><span>' + esc(fname) + (f.line?' (Line '+f.line+')':'') + '</span><code>Code Context</code></div>'
          + '<div class="code-block-body"><pre>' + esc(f.snippet) + '</pre></div>'
          + '</div>' : '')
        + (f.fix ? '<div class="fix-block">'
          + '<div class="fix-block-hdr">'
          + '<span class="fix-label">✓ Proposed Fix</span>'
          + '<button class="copy-btn" id="copy-btn-' + i + '" onclick="copyFix(' + i + ')">Copy Fix</button>'
          + '</div>'
          + '<p class="fix-text">' + esc(f.fix) + '</p>'
          + '</div>' : '')
        + '</div>';
    }).join('');
  }

  function copyFix(idx) {
    const f = getFindings()[idx];
    if (!f || !f.fix) return;
    navigator.clipboard.writeText(f.fix).then(() => {
      const btn = document.getElementById('copy-btn-' + idx);
      if (!btn) return;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy Fix'; btn.classList.remove('copied'); }, 2000);
    });
  }

  // ── Event handlers ─────────────────────────────────
  function selectCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    const tgt = document.getElementById('tab-' + cat);
    if (tgt) tgt.classList.add('active');
    CAT = cat;
    renderFindings();
  }

  function filterSeverity(sev) {
    document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('sev-' + sev).classList.add('active');
    SEV = sev;
    renderFindings();
    if (sev !== 'all') document.querySelector('.content-grid').scrollIntoView({behavior:'smooth'});
  }

  function handleSearch() {
    QUERY = document.getElementById('search-box').value;
    renderFindings();
  }

  // ── Boot ───────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    animateScore();
    buildSidebar();
    buildTrace();
    renderFindings();
  });
</script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
}
