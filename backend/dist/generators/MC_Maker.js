"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MC_Maker = void 0;
class MC_Maker {
    static createQuestion(output, difficulty) {
        // 選項已經包含在 output.options 中，不需要重新組合
        // 正確答案的索引已經在 output.correctIndex 中
        // 隨機打亂選項順序
        const shuffledOptions = this.shuffleArray([...output.options]);
        // 找出正確答案在打亂後的新位置
        const newCorrectIndex = shuffledOptions.indexOf(output.correctAnswer);
        return {
            content: output.content,
            options: shuffledOptions,
            correctIndex: newCorrectIndex,
            correctAnswer: output.correctAnswer,
            explanation: output.explanation
        };
    }
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
exports.MC_Maker = MC_Maker;
