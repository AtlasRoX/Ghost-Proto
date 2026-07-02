import { FindingSuppressionEngine } from '../../src/core/compiler/analysis/suppress/engine';
import { Finding } from '../../src/core/compiler/analysis/store/evidence';

describe('Finding Suppression Engine', () => {
  it('should suppress active findings with active config rule and ignore expired rules', () => {
    const findings: Finding[] = [
      {
        id: 'finding1',
        ruleId: 'SQL_INJECTION',
        filePath: 'test.ts',
        severity: 'high',
        message: 'SQL Injection',
        evidence: []
      },
      {
        id: 'finding2',
        ruleId: 'XSS',
        filePath: 'test.ts',
        severity: 'high',
        message: 'XSS',
        evidence: []
      }
    ];

    const suppressions = [
      { findingId: 'finding1', reason: 'False positive checked', expiryDate: '2028-12-31' },
      { findingId: 'finding2', reason: 'Legacy waiver', expiryDate: '2020-01-01' } // Expired
    ];

    const engine = new FindingSuppressionEngine(suppressions);
    const { active, suppressed } = engine.filterSuppressions(findings);

    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('finding2'); // Only the expired one remained active

    expect(suppressed).toHaveLength(1);
    expect(suppressed[0].findingId).toBe('finding1');
  });

  it('should filter findings that contain inline suppressions', () => {
    const findings: Finding[] = [
      {
        id: 'finding1',
        ruleId: 'SQL_INJECTION',
        filePath: 'test.ts',
        severity: 'high',
        message: 'SQL Injection',
        evidence: [
          {
            observationId: 'obs1',
            sourceFiles: ['test.ts'],
            flowTrace: ['query = db.query(...)', 'ghost-suppress: false positive']
          }
        ]
      }
    ];

    const engine = new FindingSuppressionEngine([]);
    const { active, suppressed } = engine.filterSuppressions(findings);

    expect(active).toHaveLength(0);
    expect(suppressed).toHaveLength(1);
    expect(suppressed[0].findingId).toBe('finding1');
  });
});
