import { CompilerContext } from './context';
import { IRNode } from './schema/nodes';

export interface IRCapability {
  name: string;
  version: number;
  experimental: boolean;
}

export interface LanguageAdapter {
  languageId: string;
  extensions: string[];
  capabilities: string[]; // List of capability names supported
  compile(ctx: CompilerContext, source: string, filePath: string): Promise<IRNode[]>;
}

export class LanguageRegistry {
  private adapters: Map<string, LanguageAdapter> = new Map();
  private capabilities: Map<string, IRCapability> = new Map();

  public registerCapability(cap: IRCapability): void {
    this.capabilities.set(cap.name, cap);
  }

  public registerAdapter(adapter: LanguageAdapter): void {
    this.adapters.set(adapter.languageId, adapter);
  }

  public getAdapterForExtension(ext: string): LanguageAdapter | undefined {
    for (const adapter of this.adapters.values()) {
      if (adapter.extensions.includes(ext)) {
        return adapter;
      }
    }
    return undefined;
  }

  public getCapability(name: string): IRCapability | undefined {
    return this.capabilities.get(name);
  }
}
