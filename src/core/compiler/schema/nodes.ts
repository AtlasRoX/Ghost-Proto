import { IRSpan, IROrigin } from './metadata';

export interface IRNode {
  id: string; // SHA-256 fingerprint hash
  kind: 'Symbol' | 'Operation' | 'Scope' | 'Edge';
  version: number;
  span: IRSpan;
  origin: IROrigin;
  metadata: Record<string, unknown>;
}

export type IRSymbolKind = 'Module' | 'Type' | 'Function' | 'Method' | 'Variable';

export interface IRSymbol extends IRNode {
  kind: 'Symbol';
  symbolKind: IRSymbolKind;
  name: string;
  fqn: string;
  parentFqn?: string;
  signature?: IRSymbolSignature;
}

export interface IRSymbolSignature {
  parameters: { name: string; type: string }[];
  returnType: string;
}
