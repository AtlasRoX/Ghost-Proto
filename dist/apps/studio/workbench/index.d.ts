import { ViewRegistry, CommandRegistry, InspectorRegistry } from './registry';
export declare class Workbench {
    views: ViewRegistry;
    commands: CommandRegistry;
    inspectors: InspectorRegistry;
    activeLayout: 'normal' | 'investigation';
    bootstrap(): Promise<void>;
    getActiveLayout(): 'normal' | 'investigation';
}
//# sourceMappingURL=index.d.ts.map