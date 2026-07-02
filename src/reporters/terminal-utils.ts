// ─────────────────────────────────────────────
//  ghostproto — Terminal UI Utilities
// ─────────────────────────────────────────────

import chalk from 'chalk';

/**
 * Regex-based lightweight syntax highlighter for code snippets in the terminal.
 */
export function highlightCode(code: string, language = 'typescript'): string {
  if (!code) return '';

  const lang = language.toLowerCase();
  if (
    lang !== 'typescript' &&
    lang !== 'javascript' &&
    lang !== 'ts' &&
    lang !== 'js' &&
    lang !== 'py' &&
    lang !== 'python' &&
    lang !== 'json'
  ) {
    return code;
  }

  // Dracula-inspired palette
  const cKeyword = chalk.hex('#ff79c6').bold;  // Magenta
  const cString = chalk.hex('#f1fa8c');        // Yellow
  const cComment = chalk.hex('#6272a4').italic; // Muted grey-blue
  const cNumber = chalk.hex('#bd93f9');        // Purple
  const cType = chalk.hex('#8be9fd').italic;   // Cyan
  const cFunction = chalk.hex('#50fa7b');      // Green
  const cBuiltin = chalk.hex('#ffb86c');       // Orange

  // Combined tokenization regex
  const tokenRegex = /(?<comment>\/\/.*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<number>\b\d+\b)|(?<keyword>\b(?:const|let|var|function|class|return|if|else|for|while|import|from|export|async|await|default|try|catch|throw|new|typeof|instanceof|interface|type|extends|implements|as|in|of|break|continue|switch|case|yield|super|this)\b)|(?<type>\b(?:string|number|boolean|any|void|unknown|never|Promise|Record|Map|Set|Array|object|undefined|null)\b)|(?<builtin>\b(?:console|process|require|module|exports|global|window|document|Math|JSON|Object|Array|String|Number|Boolean|Function|RegExp|Error)\b)|(?<identifier>\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())\b/g;

  let lastIndex = 0;
  let result = '';
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    result += code.slice(lastIndex, match.index);

    const [full] = match;
    const groups = match.groups as Record<string, string | undefined>;

    if (groups.comment) {
      result += cComment(full);
    } else if (groups.string) {
      result += cString(full);
    } else if (groups.number) {
      result += cNumber(full);
    } else if (groups.keyword) {
      result += cKeyword(full);
    } else if (groups.type) {
      result += cType(full);
    } else if (groups.builtin) {
      result += cBuiltin(full);
    } else if (groups.identifier) {
      result += cFunction(full);
    } else {
      result += full;
    }

    lastIndex = tokenRegex.lastIndex;
  }

  result += code.slice(lastIndex);
  return result;
}

/**
 * Render a unified Git-style diff comparing original code against proposed fix.
 */
export function renderDiff(original: string, updated: string, filePath?: string, lineStart = 1): string {
  if (!original && !updated) return '';
  
  const origLines = original ? original.split('\n') : [];
  const updLines = updated ? updated.split('\n') : [];

  let diffOutput = '';

  if (filePath) {
    diffOutput += chalk.red(`--- ${filePath}\n`);
    diffOutput += chalk.green(`+++ ${filePath} (proposed fix)\n`);
  }
  diffOutput += chalk.cyan(`@@ -${lineStart},${origLines.length} +${lineStart},${updLines.length} @@\n`);

  for (let i = 0; i < origLines.length; i++) {
    diffOutput += chalk.red(`- ${origLines[i]}\n`);
  }
  for (let i = 0; i < updLines.length; i++) {
    diffOutput += chalk.green(`+ ${updLines[i]}\n`);
  }

  return diffOutput.trimEnd();
}

/**
 * Render a smooth horizontal progress bar utilizing Unicode fractional block characters.
 */
export function renderSmoothBar(score: number, width = 20): string {
  const value = Math.max(0, Math.min(100, score));
  const totalFilled = (value / 100) * width;
  const fullBlocks = Math.floor(totalFilled);
  const fraction = totalFilled - fullBlocks;

  let color = chalk.hex('#C44536'); // Red for poor
  if (score >= 80) {
    color = chalk.hex('#4ee6d3'); // Bright teal for excellent
  } else if (score >= 60) {
    color = chalk.hex('#2dbfad'); // Standard teal for good
  } else if (score >= 40) {
    color = chalk.hex('#1d8a7c'); // Deep teal for warning
  }

  let bar = '█'.repeat(fullBlocks);

  if (fullBlocks < width) {
    const fracIndex = Math.round(fraction * 8);
    const fractions = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
    bar += fractions[fracIndex] || '';
  }

  // Ensure exact width padding
  const remaining = width - fullBlocks - (fraction > 0.05 ? 1 : 0);
  const empty = remaining > 0 ? '░'.repeat(remaining) : '';

  return color(bar) + chalk.hex('#5ba399')(empty);
}

/**
 * Draw a clean Unicode table using box-drawing characters.
 */
export function drawTable(headers: string[], rows: string[][], colWidths?: number[]): string {
  const widths = colWidths || headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      if (row[i]) {
        // Strip ANSI escape codes to measure true terminal text length
        const rawCell = row[i].replace(/\u001b\[\d+m/g, '');
        if (rawCell.length > max) {
          max = rawCell.length;
        }
      }
    }
    return max;
  });

  const borderStyle = {
    top: '─', topMid: '┬', topLeft: '┌', topRight: '┐',
    mid: '─', midMid: '┼', midLeft: '├', midRight: '┤',
    bot: '─', botMid: '┴', botLeft: '└', botRight: '┘',
    left: '│', right: '│', middle: '│'
  };

  let output = '';

  const makeLine = (left: string, mid: string, right: string, filler: string) => {
    return left + widths.map(w => filler.repeat(w + 2)).join(mid) + right + '\n';
  };

  // Top line
  output += chalk.hex('#1d8a7c')(makeLine(borderStyle.topLeft, borderStyle.topMid, borderStyle.topRight, borderStyle.top));

  // Header row
  output += chalk.hex('#1d8a7c')(borderStyle.left) +
    headers.map((h, i) => ' ' + chalk.hex('#4ee6d3').bold(h.padEnd(widths[i])) + ' ').join(chalk.hex('#1d8a7c')(borderStyle.middle)) +
    chalk.hex('#1d8a7c')(borderStyle.right) + '\n';

  // Divider line
  output += chalk.hex('#1d8a7c')(makeLine(borderStyle.midLeft, borderStyle.midMid, borderStyle.midRight, borderStyle.mid));

  // Rows
  for (const row of rows) {
    output += chalk.hex('#1d8a7c')(borderStyle.left) +
      row.map((cell, i) => {
        const rawCell = cell.replace(/\u001b\[\d+m/g, '');
        const padding = ' '.repeat(Math.max(0, widths[i] - rawCell.length));
        return ' ' + cell + padding + ' ';
      }).join(chalk.hex('#1d8a7c')(borderStyle.middle)) +
      chalk.hex('#1d8a7c')(borderStyle.right) + '\n';
  }

  // Bottom line
  output += chalk.hex('#1d8a7c')(makeLine(borderStyle.botLeft, borderStyle.botMid, borderStyle.botRight, borderStyle.bot));

  return output.trimEnd();
}
