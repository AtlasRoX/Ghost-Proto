import { CFG } from '../graph/cfg';

export class DominatorTree {
  public static calculate(cfg: CFG): Map<string, string[]> {
    const dominators = new Map<string, string[]>();
    const blockIds = Array.from(cfg.blocks.keys());

    // Initialize: entry dominates only itself, other nodes dominated by all nodes
    const entryId = cfg.entryBlockId;
    dominators.set(entryId, [entryId]);

    for (const id of blockIds) {
      if (id !== entryId) {
        dominators.set(id, [...blockIds]);
      }
    }

    let changed = true;
    while (changed) {
      changed = false;

      for (const id of blockIds) {
        if (id === entryId) continue;

        const block = cfg.blocks.get(id)!;
        const predecessors = block.predecessors;

        let intersection: string[] = [];
        if (predecessors.length > 0) {
          intersection = [...(dominators.get(predecessors[0]) || [])];
          for (let i = 1; i < predecessors.length; i++) {
            const predDoms = dominators.get(predecessors[i]) || [];
            intersection = intersection.filter(x => predDoms.includes(x));
          }
        }

        const newDoms = [id, ...intersection];
        const oldDoms = dominators.get(id) || [];

        if (newDoms.length !== oldDoms.length || newDoms.some(x => !oldDoms.includes(x))) {
          dominators.set(id, newDoms);
          changed = true;
        }
      }
    }

    return dominators;
  }
}
