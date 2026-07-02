/**
 * Regex-based lightweight syntax highlighter for code snippets in the terminal.
 */
export declare function highlightCode(code: string, language?: string): string;
/**
 * Render a unified Git-style diff comparing original code against proposed fix.
 */
export declare function renderDiff(original: string, updated: string, filePath?: string, lineStart?: number): string;
/**
 * Render a smooth horizontal progress bar utilizing Unicode fractional block characters.
 */
export declare function renderSmoothBar(score: number, width?: number): string;
/**
 * Draw a clean Unicode table using box-drawing characters.
 */
export declare function drawTable(headers: string[], rows: string[][], colWidths?: number[]): string;
//# sourceMappingURL=terminal-utils.d.ts.map