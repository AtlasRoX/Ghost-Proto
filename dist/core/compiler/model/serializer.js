"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONSerializer = void 0;
class JSONSerializer {
    serialize(ir) {
        // Canonical ordering: Sort nodes by their unique ID to guarantee deterministic output.
        const sortedNodes = [...ir].sort((a, b) => a.id.localeCompare(b.id));
        // Deeply stringify sorting object keys recursively.
        return JSON.stringify(sortedNodes, (_key, value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return Object.keys(value)
                    .sort()
                    .reduce((sortedObj, k) => {
                    sortedObj[k] = value[k];
                    return sortedObj;
                }, {});
            }
            return value;
        });
    }
    deserialize(serialized) {
        return JSON.parse(serialized);
    }
}
exports.JSONSerializer = JSONSerializer;
//# sourceMappingURL=serializer.js.map