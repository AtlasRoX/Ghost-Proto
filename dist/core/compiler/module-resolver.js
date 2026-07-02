"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeModuleResolver = void 0;
const path_1 = __importDefault(require("path"));
class NodeModuleResolver {
    resolve(importPath, containingFile, projectRoot) {
        if (importPath.startsWith('.')) {
            // Relative import resolution
            const absoluteDir = path_1.default.dirname(path_1.default.resolve(projectRoot, containingFile));
            const resolved = path_1.default.resolve(absoluteDir, importPath);
            return path_1.default.relative(projectRoot, resolved).replace(/\\/g, '/');
        }
        // Non-relative import mapping (e.g. package dependencies)
        return `node_modules/${importPath}`;
    }
}
exports.NodeModuleResolver = NodeModuleResolver;
//# sourceMappingURL=module-resolver.js.map