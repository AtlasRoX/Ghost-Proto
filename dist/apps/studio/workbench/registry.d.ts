export interface ContributionView {
    id: string;
    title: string;
    panel: string;
    render(): string;
}
export interface ContributionCommand {
    id: string;
    title: string;
    handler: (...args: any[]) => Promise<any>;
}
export interface ContributionInspector {
    id: string;
    targetType: string;
    render(target: any): string;
}
export declare class ViewRegistry {
    private views;
    register(view: ContributionView): void;
    get(id: string): ContributionView | undefined;
    getAll(): ContributionView[];
}
export declare class CommandRegistry {
    private commands;
    register(cmd: ContributionCommand): void;
    execute(id: string, ...args: any[]): Promise<any>;
    getAll(): ContributionCommand[];
}
export declare class InspectorRegistry {
    private inspectors;
    register(inspector: ContributionInspector): void;
    getForType(type: string): ContributionInspector[];
}
//# sourceMappingURL=registry.d.ts.map