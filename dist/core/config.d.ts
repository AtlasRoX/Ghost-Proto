export interface GhostProtoConfig {
    apiKey?: string;
}
export declare function loadConfig(): GhostProtoConfig;
export declare function saveConfig(config: GhostProtoConfig): void;
export declare function getApiKey(cliKey?: string): string | undefined;
export declare function getConfigPath(): string;
//# sourceMappingURL=config.d.ts.map