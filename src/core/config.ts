import os from 'os';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(os.homedir(), '.ghostproto.json');

export interface GhostProtoConfig {
  apiKey?: string;
}

export function loadConfig(): GhostProtoConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore read/parse errors, return empty config
  }
  return {};
}

export function saveConfig(config: GhostProtoConfig): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    throw new Error(`Failed to save config to ${CONFIG_PATH}: ${(err as Error).message}`);
  }
}

export function getApiKey(cliKey?: string): string | undefined {
  if (cliKey) return cliKey;
  if (process.env.GHOSTPROTO_API_KEY) return process.env.GHOSTPROTO_API_KEY;
  return loadConfig().apiKey;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
