import { TaintTracer as EngineTracer, TaintPath } from '../engine/taint';
import { SSATransformer } from '../engine/ssa';

export class TaintTracer {
  public static traceTaint(
    statements: string[],
    sources: string[],
    sinks: string[]
  ): TaintPath[] {
    const ssa = SSATransformer.transform(statements);
    return EngineTracer.trace(ssa, sources, sinks);
  }
}
