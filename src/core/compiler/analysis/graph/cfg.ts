import { IRSymbol } from '../../schema/nodes';

export interface CFGBlock {
  id: string;
  label: string;
  statements: string[];
  successors: string[];
  predecessors: string[];
}

export interface CFG {
  entryBlockId: string;
  blocks: Map<string, CFGBlock>;
}

export class CFGBuilder {
  public static build(func: IRSymbol): CFG {
    const blocks = new Map<string, CFGBlock>();
    const entryBlockId = `${func.fqn}:block_0`;

    // Simple CFG parser: Deconstruct statements
    const parameters = func.metadata.parameters as string[] || [];
    const statements = parameters.map(p => `param ${p}`);
    
    // Add dummy execution block
    const block: CFGBlock = {
      id: entryBlockId,
      label: 'entry',
      statements: [...statements, 'execute function body'],
      successors: [],
      predecessors: []
    };
    blocks.set(entryBlockId, block);

    return {
      entryBlockId,
      blocks
    };
  }
}
