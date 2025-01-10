"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionGenerator = void 0;
class QuestionGenerator {
    constructor(difficulty = 1, chapter) {
        this.difficulty = Math.min(Math.max(difficulty, 1), 5);
        this.chapter = chapter;
    }
}
exports.QuestionGenerator = QuestionGenerator;
