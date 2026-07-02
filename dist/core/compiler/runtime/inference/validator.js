"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseValidator = void 0;
class ResponseValidator {
    static validateJSON(text) {
        try {
            return JSON.parse(text);
        }
        catch {
            // Attempt simple markdown backticks extraction
            const matches = text.match(/```json([\s\S]*?)```/);
            if (matches && matches[1]) {
                try {
                    return JSON.parse(matches[1].trim());
                }
                catch {
                    return null;
                }
            }
            return null;
        }
    }
    static validateSchema(obj, requiredKeys) {
        return requiredKeys.every(key => key in obj);
    }
}
exports.ResponseValidator = ResponseValidator;
//# sourceMappingURL=validator.js.map