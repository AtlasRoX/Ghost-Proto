"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryExtension = void 0;
class RepositoryExtension {
    static activate(workbench) {
        // Register Repository view
        workbench.views.register({
            id: 'extension.repository.explorer',
            title: 'Repository Explorer',
            panel: 'sidebar',
            render: () => {
                return '<RepositoryExplorer />';
            }
        });
        // Register active commands
        workbench.commands.register({
            id: 'repository.index',
            title: 'Index Repository Codebase',
            handler: async (repoPath) => {
                return { status: 'indexed', path: repoPath };
            }
        });
    }
}
exports.RepositoryExtension = RepositoryExtension;
//# sourceMappingURL=index.js.map