import path from 'path';

export interface ModuleResolver {
  resolve(importPath: string, containingFile: string, projectRoot: string): string | null;
}

export class NodeModuleResolver implements ModuleResolver {
  public resolve(importPath: string, containingFile: string, projectRoot: string): string | null {
    if (importPath.startsWith('.')) {
      // Relative import resolution
      const absoluteDir = path.dirname(path.resolve(projectRoot, containingFile));
      const resolved = path.resolve(absoluteDir, importPath);
      return path.relative(projectRoot, resolved).replace(/\\/g, '/');
    }
    
    // Non-relative import mapping (e.g. package dependencies)
    return `node_modules/${importPath}`;
  }
}
