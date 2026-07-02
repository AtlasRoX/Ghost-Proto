"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestigationExtension = void 0;
class InvestigationExtension {
    static activate(workbench) {
        // Register visual workspaces
        workbench.views.register({
            id: 'extension.investigation.workspace',
            title: 'Investigation Panel',
            panel: 'main',
            render: () => {
                return '<InvestigationWorkspace />';
            }
        });
        // Register Inspector panels
        workbench.inspectors.register({
            id: 'extension.investigation.finding_inspector',
            targetType: 'finding',
            render: (finding) => {
                return `Finding Inspector: ${finding.ruleId}`;
            }
        });
    }
}
exports.InvestigationExtension = InvestigationExtension;
//# sourceMappingURL=index.js.map