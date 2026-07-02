"use strict";
// ─────────────────────────────────────────────
//  claude-audit — Types
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreToGrade = scoreToGrade;
function scoreToGrade(score) {
    if (score >= 90)
        return 'A';
    if (score >= 75)
        return 'B';
    if (score >= 60)
        return 'C';
    if (score >= 45)
        return 'D';
    return 'F';
}
//# sourceMappingURL=types.js.map