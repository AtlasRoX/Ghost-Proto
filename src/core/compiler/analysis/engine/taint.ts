import { SSAStatement, SSAVariable } from './ssa';

export interface TaintPath {
  source: string;
  sink: string;
  steps: string[];
}

export class TaintTracer {
  public static trace(
    ssaStatements: SSAStatement[],
    sources: string[],
    sinks: string[]
  ): TaintPath[] {
    const tainted = new Set<string>(); // "name_version"
    const paths: TaintPath[] = [];

    // Initialize sources as tainted
    for (const stmt of ssaStatements) {
      if (stmt.defined && sources.includes(stmt.defined.name)) {
        tainted.add(`${stmt.defined.name}_${stmt.defined.version}`);
      }
    }

    // Propagate taint
    for (const stmt of ssaStatements) {
      if (!stmt.defined) continue;

      const isUsedTainted = stmt.used.some(u => tainted.has(`${u.name}_${u.version}`));
      
      // If a used variable is tainted, the defined variable becomes tainted
      if (isUsedTainted) {
        tainted.add(`${stmt.defined.name}_${stmt.defined.version}`);
      }

      // Check if taint reaches a sink operation
      const isSink = sinks.some(sink => stmt.op.includes(sink));
      if (isSink && (isUsedTainted || sources.includes(stmt.defined.name))) {
        paths.push({
          source: sources.find(src => stmt.op.includes(src) || isUsedTainted) || 'unknown',
          sink: stmt.op,
          steps: ssaStatements.map(s => s.defined ? `${s.defined.name}_${s.defined.version} = ${s.op}` : s.op)
        });
      }
    }

    return paths;
  }
}
