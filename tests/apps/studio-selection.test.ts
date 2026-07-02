import { SelectionService } from '../../src/apps/studio/workspace/selection';
import { TimelineService } from '../../src/apps/studio/workspace/timeline';

describe('Studio Selection & Timeline Services', () => {
  it('should synchronize file, symbol, and finding selections and trigger subscriber callbacks', () => {
    const selection = new SelectionService();
    let callbackCount = 0;
    let lastSelection = selection.getSelection();

    const unsubscribe = selection.subscribe((sel) => {
      callbackCount++;
      lastSelection = sel;
    });

    selection.selectFile('src/index.ts');
    expect(callbackCount).toBe(1);
    expect(lastSelection.activeFile).toBe('src/index.ts');

    selection.selectSymbol('src/index.ts:main');
    expect(callbackCount).toBe(2);
    expect(lastSelection.selectedSymbolFqn).toBe('src/index.ts:main');

    selection.selectFinding('finding_01');
    expect(callbackCount).toBe(3);
    expect(lastSelection.currentFindingId).toBe('finding_01');

    unsubscribe();
    selection.selectFile('another.ts');
    expect(callbackCount).toBe(3); // Subscription deleted, should not change
  });

  it('should record execution timeline steps and support scrubbing back-and-forth', () => {
    const timeline = new TimelineService();

    timeline.logStep('COMPILER_INDEX');
    timeline.logStep('ANALYSIS_CFG');
    timeline.logStep('INFERENCE_RUN');

    expect(timeline.getEvents()).toHaveLength(3);
    expect(timeline.getCurrentStep()?.stepName).toBe('INFERENCE_RUN');

    // Scrub back
    timeline.scrubTo(1); // Index 1 is ANALYSIS_CFG
    expect(timeline.getCurrentStep()?.stepName).toBe('ANALYSIS_CFG');

    // Log a new step which should slice future events
    timeline.logStep('CONSENSUS_VOTE');
    expect(timeline.getEvents()).toHaveLength(3); // [COMPILER_INDEX, ANALYSIS_CFG, CONSENSUS_VOTE]
    expect(timeline.getEvents().map(e => e.stepName)).toEqual([
      'COMPILER_INDEX',
      'ANALYSIS_CFG',
      'CONSENSUS_VOTE'
    ]);
  });
});
