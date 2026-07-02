import chalk from 'chalk';
import { renderSmoothBar, highlightCode, renderDiff, drawTable } from '../../src/reporters/terminal-utils';

chalk.level = 1;

describe('Terminal UI Utilities', () => {
  describe('renderSmoothBar', () => {
    it('should render a correct length bar', () => {
      const bar = renderSmoothBar(50, 10);
      const raw = bar.replace(/\u001b\[\d+m/g, '');
      expect(raw.length).toBe(10);
    });

    it('should render correct fractional characters', () => {
      const bar1 = renderSmoothBar(85, 20);
      const raw1 = bar1.replace(/\u001b\[\d+m/g, '');
      expect(raw1.slice(0, 17)).toBe('█'.repeat(17));
    });
  });

  describe('highlightCode', () => {
    it('should return empty string if no code provided', () => {
      expect(highlightCode('')).toBe('');
    });

    it('should highlight keywords', () => {
      const code = 'const x = 10;';
      const highlighted = highlightCode(code, 'typescript');
      expect(highlighted).toContain('\u001b[');
    });
    
    it('should leave unknown languages alone', () => {
      const code = 'some raw text';
      const highlighted = highlightCode(code, 'unknown');
      expect(highlighted).toBe(code);
    });
  });

  describe('renderDiff', () => {
    it('should render original and updated code correctly with red/green markers', () => {
      const orig = 'old code';
      const upd = 'new code';
      const diff = renderDiff(orig, upd, 'test.ts', 10);
      expect(diff).toContain('- old code');
      expect(diff).toContain('+ new code');
      expect(diff).toContain('@@ -10,1 +10,1 @@');
    });
  });

  describe('drawTable', () => {
    it('should render formatted borders and columns', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2'], ['3', '4']];
      const table = drawTable(headers, rows);
      expect(table).toContain('┌');
      expect(table).toContain('┐');
      expect(table).toContain('└');
      expect(table).toContain('┘');
      expect(table).toContain('A');
      expect(table).toContain('B');
      expect(table).toContain('1');
    });
  });
});
