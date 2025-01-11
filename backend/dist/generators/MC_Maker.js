"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MC_Maker = void 0;

class MC_Maker {
    static createQuestion(output, difficulty) {
        // 合并正确答案和错误答案
        const allOptions = [output.correctAnswer, ...output.wrongAnswers];
        
        // 打乱选项顺序
        const shuffledOptions = this.shuffleArray(allOptions);
        
        // 找出正确答案的新位置
        const correctIndex = shuffledOptions.indexOf(output.correctAnswer);

        return {
            id: this.generateId(),
            type: 'multiple-choice',
            difficulty: difficulty,
            content: output.content,
            options: shuffledOptions,
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
