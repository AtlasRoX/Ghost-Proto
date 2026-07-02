export interface SuppressionRule {
    findingId: string;
    reason: string;
    expiryDate?: string;
}
export interface SuppressionsConfig {
    globalSuppressions: SuppressionRule[];
}
//# sourceMappingURL=types.d.ts.map