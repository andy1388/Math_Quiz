"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionGenerator = void 0;
class QuestionGenerator {
    constructor(difficulty, topic) {
        this.difficulty = difficulty;
        this.topic = topic;
    }
    // 通用的辅助方法
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    // 生成随机整数
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // 生成随机选择
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
exports.QuestionGenerator = QuestionGenerator;
