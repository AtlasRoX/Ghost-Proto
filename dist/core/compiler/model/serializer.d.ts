import { IRNode } from '../schema/nodes';
export interface IRSerializer {
    serialize(ir: IRNode[]): string;
    deserialize(serialized: string): IRNode[];
}
export declare class JSONSerializer implements IRSerializer {
    serialize(ir: IRNode[]): string;
    deserialize(serialized: string): IRNode[];
}
//# sourceMappingURL=serializer.d.ts.map