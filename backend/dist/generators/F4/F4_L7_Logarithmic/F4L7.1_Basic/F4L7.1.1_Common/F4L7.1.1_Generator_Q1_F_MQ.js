"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QuestionGenerator_1 = require("../../../QuestionGenerator");
class F4L7_1_1_Generator_Q1_F_MQ extends QuestionGenerator_1.QuestionGenerator {
    constructor() {
        super(1, 'F4L7.1.1');
    }
    generateNumber() {
        // 随机选择数字类型
        const type = Math.floor(Math.random() * 4);
        let number;
        switch (type) {
            case 0: // 整数 2-9
                number = Math.floor(Math.random() * 8) + 2;
                break;
            case 1: // 1
                number = 1;
                break;
            case 2: // 较大整数 10-9999
                number = Math.floor(Math.random() * 9990) + 10;
                break;
            default: // 小数 0.1-0.9
                number = (Math.floor(Math.random() * 9) + 1) / 10;
                break;
        }
        // 计算对数值（保留3位小数）
        const result = Number(Math.log10(number).toFixed(3));
        return { number, result };
    }
    generateWrongAnswers(correctResult) {
        const wrongAnswers = new Set();
        while (wrongAnswers.size < 3) {
            // 生成错误答案的策略
            const strategy = Math.floor(Math.random() * 3);
            let wrongAnswer;
            switch (strategy) {
                case 0: // 正负号错误
                    wrongAnswer = -correctResult;
                    break;
                case 1: // 小数点位置错误
                    wrongAnswer = correctResult < 0 ?
                        Number((correctResult * 10).toFixed(3)) :
                        Number((correctResult / 10).toFixed(3));
                    break;
                case 2: // 计算错误（稍微改变值）
                    const variation = (Math.random() * 0.2 - 0.1); // -0.1 到 0.1 的随机变化
                    wrongAnswer = Number((correctResult + variation).toFixed(3));
                    break;
                default:
                    wrongAnswer = Number((correctResult + 1).toFixed(3));
            }
            // 确保错误答案与正确答案不同，且是3位小数
            if (Math.abs(wrongAnswer - correctResult) > 0.001) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        return Array.from(wrongAnswers);
    }
    generate() {
        // 生成题目和正确答案
        const { number, result } = this.generateNumber();
        // 生成题目表达式
        const expression = `\\log ${number}`;
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(result);
        // 生成所有选项并打乱顺序
        const options = [result.toString(), ...wrongAnswers.map(x => x.toString())];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(result.toString());
        // 生成解题步骤
        const steps = this.generateSteps(number, result);
        return {
            content: expression,
            correctAnswer: result.toString(),
            options: shuffledOptions,
            correctIndex: correctIndex,
            explanation: steps
        };
    }
    generateSteps(number, result) {
        let steps = `解題步驟：\n`;
        steps += `1. 使用計算機計算 \\log ${number}\n`;
        steps += `2. 確保答案準確到小數點後3位\n`;
        if (number < 1) {
            steps += `3. 注意：當 ${number} < 1 時，結果為負數\n`;
        }
        else if (number >= 10) {
            steps += `3. 注意：當 ${number} ≥ 10 時，結果為正數且可能大於1\n`;
        }
        steps += `\n最終答案：${result}`;
        return steps;
    }
}
exports.default = F4L7_1_1_Generator_Q1_F_MQ;
