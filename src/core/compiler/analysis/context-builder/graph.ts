import { IRSymbol } from '../../schema/nodes';
import { Finding } from '../store/evidence';

export interface ContextGraphNode {
  id: string;
  type: 'symbol' | 'finding' | 'path';
  data: any;
}

export interface ContextGraphEdge {
  from: string;
  to: string;
}

export class ContextGraph {
  public nodes = new Map<string, ContextGraphNode>();
  public edges: ContextGraphEdge[] = [];

  public addNode(node: ContextGraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(from: string, to: string): void {
    this.edges.push({ from, to });
  }

  public getSymbols(): IRSymbol[] {
    return Array.from(this.nodes.values())
      .filter(n => n.type === 'symbol')
      .map(n => n.data as IRSymbol);
  }

  public getFindings(): Finding[] {
    return Array.from(this.nodes.values())
      .filter(n => n.type === 'finding')
      .map(n => n.data as Finding);
  }

  public getPaths(): string[][] {
    return Array.from(this.nodes.values())
      .filter(n => n.type === 'path')
      .map(n => n.data as string[]);
  }
}
