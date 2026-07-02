import { IRNode } from '../schema/nodes';

export interface IRSerializer {
  serialize(ir: IRNode[]): string;
  deserialize(serialized: string): IRNode[];
}

export class JSONSerializer implements IRSerializer {
  public serialize(ir: IRNode[]): string {
    // Canonical ordering: Sort nodes by their unique ID to guarantee deterministic output.
    const sortedNodes = [...ir].sort((a, b) => a.id.localeCompare(b.id));

    // Deeply stringify sorting object keys recursively.
    return JSON.stringify(sortedNodes, (_key, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((sortedObj: Record<string, unknown>, k) => {
            sortedObj[k] = value[k];
            return sortedObj;
          }, {});
      }
      return value;
    });
  }

  public deserialize(serialized: string): IRNode[] {
    return JSON.parse(serialized) as IRNode[];
  }
}
