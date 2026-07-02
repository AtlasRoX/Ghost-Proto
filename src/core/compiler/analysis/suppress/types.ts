export interface SuppressionRule {
  findingId: string;
  reason: string;
  expiryDate?: string; // ISO format
}

export interface SuppressionsConfig {
  globalSuppressions: SuppressionRule[];
}
