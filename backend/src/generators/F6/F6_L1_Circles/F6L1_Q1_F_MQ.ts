import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface IndexQuestion {
    base1: number;
    exp1: number;
    base2: number;
    exp2: number;
    result: string;
}

export default class F6_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F6L1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const content = this.formatQuestion(question);
        const correctAnswer = this.formatAnswer(question.result);
        const wrongAnswers = this.generateWrongAnswers(question);

        return {
            content,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(question),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateQuestion(): IndexQuestion {
        let base1: number, base2: number, exp1: number, exp2: number;

        switch (this.difficulty) {
            case 1:
                // 简单的指数运算，底数和指数均为个位数
                base1 = getRandomInt(2, 5);
                base2 = getRandomInt(2, 5);
                exp1 = getRandomInt(2, 4);
                exp2 = getRandomInt(2, 4);
                break;
            case 2:
                // 中等难度，底数和指数为两位数
                base1 = getRandomInt(2, 10);
                base2 = getRandomInt(2, 10);
                exp1 = getRandomInt(10, 20);
                exp2 = getRandomInt(10, 20);
                break;
            case 3:
                // 较复杂的指数运算
                base1 = getRandomInt(3, 12);
                base2 = getRandomInt(2, 8);
                exp1 = getRandomInt(20, 50);
                exp2 = getRandomInt(20, 50);
                break;
            case 4:
                // 复杂的指数运算
                base1 = getRandomInt(5, 15);
                base2 = getRandomInt(2, 10);
                exp1 = getRandomInt(50, 100);
                exp2 = getRandomInt(50, 100);
                break;
            case 5:
                // 高难度指数运算
                base1 = getRandomInt(8, 20);
                base2 = getRandomInt(2, 12);
                exp1 = getRandomInt(100, 300);
                exp2 = getRandomInt(100, 300);
                break;
            default:
                base1 = 2;
                base2 = 2;
                exp1 = 2;
                exp2 = 2;
        }

        // 计算结果（由于数字可能非常大，我们保持指数形式）
        const result = this.calculateResult(base1, exp1, base2, exp2);

        return {
            base1,
            exp1,
            base2,
            exp2,
            result
        };
    }

    private calculateResult(base1: number, exp1: number, base2: number, exp2: number): string {
        // 对于大数，我们返回简化的指数形式
        if (base1 === base2) {
            return `${base1}^{${exp1 + exp2}}`;
        }
        
        // 如果指数相同
        if (exp1 === exp2) {
            return `(${base1}\\times${base2})^{${exp1}}`;
        }

        // 一般情况下保持原始形式
        return `${base1}^{${exp1}}\\times${base2}^{${exp2}}`;
    }

    private formatQuestion(question: IndexQuestion): string {
        return `計算下列指數運算的結果：\\[${question.base1}^{${question.exp1}}\\times${question.base2}^{${question.exp2}}\\]`;
    }

    private formatAnswer(result: string): string {
        return `$${result}$`;
    }

    private generateWrongAnswers(question: IndexQuestion): string[] {
        const wrongAnswers = new Set<string>();

        // 错误1：把指数相加而不是保持乘法
        wrongAnswers.add(`$${question.base1 + question.base2}^{${question.exp1}}$`);

        // 错误2：底数和指数位置颠倒
        wrongAnswers.add(`$${question.exp1}^{${question.base1}}\\times${question.exp2}^{${question.base2}}$`);

        // 错误3：只计算一部分
        wrongAnswers.add(`$${question.base1}^{${question.exp1}}$`);

        // 错误4：错误地合并底数和指数
        wrongAnswers.add(`$${question.base1 * question.base2}^{${question.exp1 + question.exp2}}$`);

        // 确保有足够的错误答案
        while (wrongAnswers.size < 3) {
            const randomBase = getRandomInt(2, 20);
            const randomExp = getRandomInt(Math.min(question.exp1, question.exp2), 
                                        Math.max(question.exp1, question.exp2));
            wrongAnswers.add(`$${randomBase}^{${randomExp}}$`);
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateExplanation(question: IndexQuestion): string {
        return `解題步驟：

\\[1.\\space 題目：${question.base1}^{${question.exp1}}\\times${question.base2}^{${question.exp2}}\\]

\\[2.\\space 使用指數運算法則：\\]
${this.getExplanationSteps(question)}

\\[3.\\space 因此，答案為\\space ${question.result}\\]

注意：
- 當底數相同時，指數相加：a^m\\times a^n = a^{m+n}
- 當底數不同時，保持原式：a^m\\times b^n
- 當指數相同時，可寫成：(a\\times b)^n`;
    }

    private getExplanationSteps(question: IndexQuestion): string {
        if (question.base1 === question.base2) {
            return `因為底數相同（都是${question.base1}），所以可以把指數相加：
\\[${question.base1}^{${question.exp1}}\\times${question.base2}^{${question.exp2}} = ${question.base1}^{${question.exp1 + question.exp2}}\\]`;
        }

        if (question.exp1 === question.exp2) {
            return `因為指數相同（都是${question.exp1}），所以可以寫成：
\\[${question.base1}^{${question.exp1}}\\times${question.base2}^{${question.exp2}} = (${question.base1}\\times${question.base2})^{${question.exp1}}\\]`;
        }

        return `因為底數和指數都不同，所以保持原式：
\\[${question.base1}^{${question.exp1}}\\times${question.base2}^{${question.exp2}}\\]`;
    }
} 