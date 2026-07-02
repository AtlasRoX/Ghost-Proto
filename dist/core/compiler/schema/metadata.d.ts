export interface IRSpan {
    file: string;
    start: {
        offset: number;
        line: number;
        column: number;
    };
    end: {
        offset: number;
        line: number;
        column: number;
    };
}
export interface IROrigin {
    language: string;
    parser: string;
    parserVersion: string;
}
//# sourceMappingURL=metadata.d.ts.map