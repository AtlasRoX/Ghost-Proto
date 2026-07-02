import { Rule } from './types';

export interface RulePackMetadata {
  id: string;
  version: string;
  depends: string[];
  capabilities: string[];
}

export class RulePack {
  constructor(
    public readonly metadata: RulePackMetadata,
    public readonly rules: Rule[]
  ) {}

  public validatePrerequisites(availableCapabilities: string[]): { valid: boolean; missing: string[] } {
    const missing = this.metadata.capabilities.filter(cap => !availableCapabilities.includes(cap));
    return {
      valid: missing.length === 0,
      missing
    };
  }
}
