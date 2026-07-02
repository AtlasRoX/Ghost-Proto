import { AnalysisContext } from '../context';

export interface Observation {
  id: string;
  ruleId: string;
  filePath: string;
  symbolFqn?: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  message: string;
  evidence: string[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'architecture';
  execute(ctx: AnalysisContext): Promise<Observation[]>;
}
