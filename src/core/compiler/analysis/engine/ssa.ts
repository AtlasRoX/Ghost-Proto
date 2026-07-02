export interface SSAVariable {
  name: string;
  version: number;
}

export interface SSAStatement {
  defined: SSAVariable | null;
  used: SSAVariable[];
  op: string;
}

export class SSATransformer {
  public static transform(statements: string[]): SSAStatement[] {
    const versions = new Map<string, number>();
    const ssaStatements: SSAStatement[] = [];

    const nextVersion = (name: string): number => {
      const v = (versions.get(name) ?? -1) + 1;
      versions.set(name, v);
      return v;
    };

    const currentVersion = (name: string): number => {
      return versions.get(name) ?? 0;
    };

    for (const stmt of statements) {
      if (stmt.includes('=')) {
        // e.g. "x = y + z" or "x = input"
        const [left, right] = stmt.split('=').map(s => s.trim());
        const leftName = left;
        const rightTokens = right.split(/\s+/);
        
        const used: SSAVariable[] = [];
        const matches = right.match(/[a-zA-Z_]\w*/g) || [];
        for (const token of matches) {
          used.push({ name: token, version: currentVersion(token) });
        }

        const defined: SSAVariable = { name: leftName, version: nextVersion(leftName) };

        ssaStatements.push({
          defined,
          used,
          op: right
        });
      } else if (stmt.startsWith('param ')) {
        const paramName = stmt.substring(6).trim();
        ssaStatements.push({
          defined: { name: paramName, version: nextVersion(paramName) },
          used: [],
          op: 'parameter'
        });
      } else {
        // generic expression
        ssaStatements.push({
          defined: null,
          used: [],
          op: stmt
        });
      }
    }

    return ssaStatements;
  }
}
