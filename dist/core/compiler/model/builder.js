"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmutableIRBuilder = void 0;
const crypto_1 = __importDefault(require("crypto"));
class ImmutableIRBuilder {
    static createSymbol(symbolKind, name, fqn, span, origin, parentFqn, metadata = {}) {
        const rawContent = `${symbolKind}:${fqn}:${parentFqn || ''}:${JSON.stringify(origin)}:${JSON.stringify(metadata)}`;
        const id = crypto_1.default.createHash('sha256').update(rawContent).digest('hex');
        return {
            id,
            kind: 'Symbol',
            symbolKind,
            name,
            fqn,
            parentFqn,
            version: 1,
            span,
            origin,
            metadata
        };
    }
    static createEdge(edgeKind, fromNodeId, toNodeId, span, origin, metadata = {}) {
        const rawContent = `${edgeKind}:${fromNodeId}:${toNodeId}`;
        const id = crypto_1.default.createHash('sha256').update(rawContent).digest('hex');
        return {
            id,
            kind: 'Edge',
            edgeKind,
            fromNodeId,
            toNodeId,
            version: 1,
            span,
            origin,
            metadata
        };
    }
}
exports.ImmutableIRBuilder = ImmutableIRBuilder;
//# sourceMappingURL=builder.js.map