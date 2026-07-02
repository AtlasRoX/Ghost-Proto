import { KnowledgeBase } from '../../src/core/compiler/runtime/knowledge';
import { Finding } from '../../src/core/compiler/analysis/store/evidence';

describe('Knowledge Base Baseline Metrics', () => {
  it('should record baseline metrics and historic audit finding lists', () => {
    const kb = new KnowledgeBase();

    kb.setBaselineMetric('avg_complexity', 8.2);
    expect(kb.getBaselineMetric('avg_complexity')).toBe(8.2);

    const mockFinding: Finding = {
      id: 'finding1',
      ruleId: 'TEST_RULE',
      filePath: 'test.ts',
      severity: 'low',
      message: 'test message',
      evidence: []
    };

    kb.recordAudit([mockFinding]);
    expect(kb.history).toHaveLength(1);
    expect(kb.history[0].findings[0].ruleId).toBe('TEST_RULE');
  });
});
