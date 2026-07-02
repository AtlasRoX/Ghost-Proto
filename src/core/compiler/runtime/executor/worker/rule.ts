import { Worker } from './types';
import { ExecutionTask } from '../dag';
import { ExecutionContext } from '../../context';

export class RuleWorker implements Worker {
  public async execute(task: ExecutionTask, ctx: ExecutionContext): Promise<any> {
    const ruleId = task.payload.ruleId;
    const rulePacks = task.payload.rulePacks as string[] | undefined;

    ctx.logEvent('RULE_START', `Executing rule checks: ${ruleId || (rulePacks ? rulePacks.join(',') : 'all')}`);
    
    // Simulate rule validation on the blackboard
    const findings = await ctx.analysis.analyze();
    for (const f of findings) {
      const match = ruleId ? f.ruleId === ruleId : (rulePacks ? rulePacks.includes(f.ruleId) : true);
      if (match) {
        ctx.blackboard.publish({
          id: `obs:${f.id}`,
          sourceWorker: 'RuleWorker',
          timestamp: new Date().toISOString(),
          data: { findingId: f.id, ruleId: f.ruleId, filePath: f.filePath }
        });
      }
    }

    ctx.logEvent('RULE_COMPLETED', `Completed rule checks`);
    return findings;
  }

  public async verify(task: ExecutionTask, ctx: ExecutionContext): Promise<boolean> {
    const ruleId = task.payload.ruleId;
    const rulePacks = task.payload.rulePacks as string[] | undefined;
    const obs = ctx.blackboard.getObservations();

    if (ruleId) {
      return obs.some(o => o.data.ruleId === ruleId);
    }
    if (rulePacks) {
      return obs.some(o => rulePacks.includes(o.data.ruleId));
    }
    return obs.length > 0;
  }
}
