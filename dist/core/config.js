"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getApiKey = getApiKey;
exports.getConfigPath = getConfigPath;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const CONFIG_PATH = path_1.default.join(os_1.default.homedir(), '.ghostproto.json');
function loadConfig() {
    try {
        if (fs_1.default.existsSync(CONFIG_PATH)) {
            const data = fs_1.default.readFileSync(CONFIG_PATH, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch {
        // Ignore read/parse errors, return empty config
    }
    return {};
}
function saveConfig(config) {
    try {
        fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    }
    catch (err) {
        throw new Error(`Failed to save config to ${CONFIG_PATH}: ${err.message}`);
    }
}
function getApiKey(cliKey) {
    if (cliKey)
        return cliKey;
    if (process.env.GHOSTPROTO_API_KEY)
        return process.env.GHOSTPROTO_API_KEY;
    return loadConfig().apiKey;
}
function getConfigPath() {
    return CONFIG_PATH;
}
//# sourceMappingURL=config.js.map