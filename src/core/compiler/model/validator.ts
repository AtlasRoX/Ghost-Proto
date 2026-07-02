import { CompilerContext } from '../context';
import { IRNode, IRSymbol } from '../schema/nodes';
import { IREdge } from '../schema/edges';

export class GhostIRValidator {
  public static validate(ctx: CompilerContext, ir: IRNode[], level: 1 | 2 | 3 | 4): boolean {
    if (level >= 1) {
      this.validateLevel1(ctx, ir);
    }
    if (level >= 2) {
      this.validateLevel2(ctx, ir);
    }
    if (level >= 3) {
      this.validateLevel3(ctx, ir);
    }
    if (level >= 4) {
      this.validateLevel4(ctx, ir);
    }
    return !ctx.hasErrors();
  }

  private static validateLevel1(ctx: CompilerContext, ir: IRNode[]): void {
    for (const node of ir) {
      if (!node.id || !node.kind || !node.span || !node.origin) {
        ctx.emit({
          severity: 'error',
          code: 'ERR_SCHEMA_L1',
          message: `Node of type ${node.kind || 'unknown'} has missing required schema fields.`
        });
      }
    }
  }

  private static validateLevel2(ctx: CompilerContext, ir: IRNode[]): void {
    const nodeIds = new Set(ir.map(n => n.id));
    for (const node of ir) {
      if (node.kind === 'Edge') {
        const edge = node as IREdge;
        if (!nodeIds.has(edge.fromNodeId)) {
          ctx.emit({
            severity: 'error',
            code: 'ERR_REF_INTEGRITY_L2',
            message: `Edge ${edge.id} references missing source node ${edge.fromNodeId}.`,
            location: edge.span
          });
        }
        if (!nodeIds.has(edge.toNodeId)) {
          ctx.emit({
            severity: 'error',
            code: 'ERR_REF_INTEGRITY_L2',
            message: `Edge ${edge.id} references missing target node ${edge.toNodeId}.`,
            location: edge.span
          });
        }
      }
    }
  }

  private static validateLevel3(ctx: CompilerContext, ir: IRNode[]): void {
    // Check that nested symbols reference parent symbols correctly
    const symbolMap = new Map<string, IRSymbol>();
    for (const node of ir) {
      if (node.kind === 'Symbol') {
        const sym = node as IRSymbol;
        symbolMap.set(sym.fqn, sym);
      }
    }

    for (const sym of symbolMap.values()) {
      if (sym.parentFqn && !symbolMap.has(sym.parentFqn)) {
        ctx.emit({
          severity: 'warning',
          code: 'WARN_SEMANTIC_L3',
          message: `Symbol ${sym.fqn} references parent ${sym.parentFqn} which is not declared in this compilation unit.`,
          location: sym.span
        });
      }
    }
  }

  private static validateLevel4(ctx: CompilerContext, ir: IRNode[]): void {
    // Verify no circular parent hierarchy relationships
    const symbolMap = new Map<string, IRSymbol>();
    for (const node of ir) {
      if (node.kind === 'Symbol') {
        const sym = node as IRSymbol;
        symbolMap.set(sym.fqn, sym);
      }
    }

    for (const sym of symbolMap.values()) {
      let current = sym;
      const seen = new Set<string>();
      while (current.parentFqn) {
        if (seen.has(current.parentFqn)) {
          ctx.emit({
            severity: 'error',
            code: 'ERR_OPT_SAFETY_L4',
            message: `Circular parent relationship hierarchy detected around symbol ${sym.fqn}.`,
            location: sym.span
          });
          break;
        }
        seen.add(current.parentFqn);
        const parent = symbolMap.get(current.parentFqn);
        if (!parent) break;
        current = parent;
      }
    }
  }
}
