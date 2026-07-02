import { SSATransformer, SSAStatement } from '../engine/ssa';

export class VariableTracer {
  public static traceVariable(statements: string[], targetVar: string): SSAStatement[] {
    const ssa = SSATransformer.transform(statements);
    // Find all assignments/statements where the variable is defined or used
    return ssa.filter(stmt => {
      const isDef = stmt.defined?.name === targetVar;
      const isUsed = stmt.used.some(u => u.name === targetVar);
      return isDef || isUsed;
    });
  }
}
