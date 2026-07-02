"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workbench = void 0;
const registry_1 = require("./registry");
class Workbench {
    constructor() {
        this.views = new registry_1.ViewRegistry();
        this.commands = new registry_1.CommandRegistry();
        this.inspectors = new registry_1.InspectorRegistry();
        this.activeLayout = 'normal';
    }
    async bootstrap() {
        // Register default global commands
        this.commands.register({
            id: 'workbench.layout.reset',
            title: 'Reset Workbench Layout',
            handler: async () => {
                this.activeLayout = 'normal';
            }
        });
        this.commands.register({
            id: 'workbench.layout.investigate',
            title: 'Switch to Investigation Mode',
            handler: async () => {
                this.activeLayout = 'investigation';
            }
        });
    }
    getActiveLayout() {
        return this.activeLayout;
    }
}
exports.Workbench = Workbench;
//# sourceMappingURL=index.js.map