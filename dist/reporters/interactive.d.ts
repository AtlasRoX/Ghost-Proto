import type { AuditReport } from '../core/types';
export declare class InteractiveReporter {
    private report;
    private currentScreen;
    private selectedCategoryIndex;
    private activeCategory;
    private selectedFindingIndex;
    private activeFinding;
    private showConfirmFix;
    private fixMessage;
    constructor(report: AuditReport);
    start(): void;
    private clear;
    private handleKeypress;
    private handleDashboardKeys;
    private handleCategoryKeys;
    private handleFindingKeys;
    private applyProposedFix;
    private recalculateCounts;
    private exit;
    private render;
    private renderHeader;
    private renderDashboard;
    private renderCategory;
    private renderFinding;
}
//# sourceMappingURL=interactive.d.ts.map