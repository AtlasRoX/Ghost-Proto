import { IRSymbol } from '../../schema/nodes';
import { Finding } from '../store/evidence';

export interface ContextBudget {
  maxFiles: number;
  maxSymbols: number;
  maxEvidence: number;
  maxPaths: number;
}

export interface ContextPackage {
  policyName?: string;
  symbols: IRSymbol[];
  findings: Finding[];
  paths: string[][];
  metrics: {
    symbolCount: number;
    findingsCount: number;
    pathsCount: number;
  };
}
