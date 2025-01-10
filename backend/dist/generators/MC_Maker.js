"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MC_Maker = void 0;
class MC_Maker {
    static createQuestion(output, difficulty) {
        // 打亂選項順序
        const options = [...output.wrongAnswers, output.correctAnswer];
        const shuffled = this.shuffleArray(options);
        const correctIndex = shuffled.indexOf(output.correctAnswer);
        return {
            id: this.generateId(),
            type: 'multiple-choice',
            difficulty: difficulty,
            content: output.question,
            options: shuffled,
            correctIndex: correctIndex,
            answer: output.correctAnswer,
            explanation: output.explanation
        };
    }
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    static generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
exports.MC_Maker = MC_Maker;
