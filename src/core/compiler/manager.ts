import { CompilerContext } from './context';
import { IRNode } from './schema/nodes';

export interface CompilerPass {
  name: string;
  dependencies: string[];
  invalidates: string[];
  parallelizable: boolean;
  execute(ctx: CompilerContext, ir: IRNode[]): Promise<IRNode[]>;
}

export class PassManager {
  private passes: Map<string, CompilerPass> = new Map();

  public registerPass(pass: CompilerPass): void {
    this.passes.set(pass.name, pass);
  }

  public getPassSchedule(): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(`Circular dependency detected in compiler passes: ${name}`);
      }
      if (!visited.has(name)) {
        temp.add(name);
        const pass = this.passes.get(name);
        if (pass) {
          for (const dep of pass.dependencies) {
            visit(dep);
          }
        }
        temp.delete(name);
        visited.add(name);
        order.push(name);
      }
    };

    for (const name of this.passes.keys()) {
      visit(name);
    }

    return order;
  }

  public async executePipeline(ctx: CompilerContext, initialIr: IRNode[]): Promise<IRNode[]> {
    const schedule = this.getPassSchedule();
    let currentIr = initialIr;

    for (const passName of schedule) {
      const pass = this.passes.get(passName);
      if (pass) {
        currentIr = await pass.execute(ctx, currentIr);
      }
    }

    return currentIr;
  }
}
