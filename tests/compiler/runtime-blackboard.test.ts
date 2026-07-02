import { Blackboard, RuntimeObservation } from '../../src/core/compiler/runtime/memory/blackboard';

describe('Shared Blackboard Space', () => {
  it('should support publishing observations and isolating transaction changes', () => {
    const blackboard = new Blackboard();

    const obs1: RuntimeObservation = {
      id: 'obs1',
      sourceWorker: 'SecurityWorker',
      timestamp: new Date().toISOString(),
      data: { finding: 'sql injection' }
    };

    blackboard.publish(obs1);
    expect(blackboard.getObservations()).toHaveLength(1);

    // Start transaction
    blackboard.beginTransaction();
    const obs2: RuntimeObservation = {
      id: 'obs2',
      sourceWorker: 'PerfWorker',
      timestamp: new Date().toISOString(),
      data: { finding: 'complexity high' }
    };
    blackboard.publish(obs2);

    // Should contain both in transaction view
    expect(blackboard.getObservations()).toHaveLength(2);

    // Rollback transaction
    blackboard.rollbackTransaction();
    expect(blackboard.getObservations()).toHaveLength(1);
    expect(blackboard.getObservations()[0].id).toBe('obs1');
  });

  it('should commit observations successfully', () => {
    const blackboard = new Blackboard();
    blackboard.beginTransaction();
    
    blackboard.publish({
      id: 'obs',
      sourceWorker: 'Worker',
      timestamp: new Date().toISOString(),
      data: {}
    });

    blackboard.commitTransaction();
    expect(blackboard.getObservations()).toHaveLength(1);
  });
});
