"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptRenderer = void 0;
const markdown_1 = require("./markdown");
class PromptRenderer {
    static renderPrompt(pkg, maxTokens = 4096) {
        const rawMarkdown = markdown_1.MarkdownRenderer.render(pkg);
        // Simple word-count based token estimator (1 token ~= 4 characters or 0.75 words)
        const estimatedTokens = Math.ceil(rawMarkdown.length / 4);
        if (estimatedTokens <= maxTokens) {
            return `[SYSTEM CONTEXT]\n${rawMarkdown}\n[/SYSTEM CONTEXT]`;
        }
        // Truncate if token size exceeds budget limit
        const allowedLength = maxTokens * 4;
        const truncated = rawMarkdown.substring(0, allowedLength) + '\n... [TRUNCATED]';
        return `[SYSTEM CONTEXT]\n${truncated}\n[/SYSTEM CONTEXT]`;
    }
}
exports.PromptRenderer = PromptRenderer;
//# sourceMappingURL=prompt.js.map