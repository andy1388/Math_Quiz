import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, roundTo } from '@/utils/mathUtils';

type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface LogExpression {
    expression: string;
    value: number;
}

export default class F4L7_1_1_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        console.log('Initializing F4L7.1.1_Q2_F_MQ with difficulty:', difficulty);
        super(difficulty, 'F4L7.1.1_Q2_F_MQ', 10);
        console.log('F4L7.1.1_Q2_F_MQ initialized with max difficulty:', this.maxDifficulty);
    }

    private generateExpression(difficulty: Difficulty): LogExpression {
        switch(difficulty) {
            case 1: // 10的整數次方
                const power = getRandomInt(1, 4);
                return {
                    expression: `log ${Math.pow(10, power)}`,
                    value: power
                };

            case 2: // 小數點後多位
                const negPower = -getRandomInt(1, 5);
                return {
                    expression: `log ${Math.pow(10, negPower)}`,
                    value: negPower
                };

            case 3: // 數字運算
                const num1 = getRandomInt(2, 5);
                const num2 = getRandomInt(10, 50) * 10;
                const num3 = getRandomInt(2, 9);
                const product = num1 * num2 * num3;
                return {
                    expression: `log(${num1}×${num2}×${num3})`,
                    value: Math.log10(product)
                };

            case 4: // 10的正負次方
                const largePower = getRandomInt(100, 500) * (Math.random() < 0.5 ? 1 : -1);
                return {
                    expression: `log 10^{${largePower}}`,
                    value: largePower
                };

            case 5: // 根號運算
                const baseNum = Math.pow(10, getRandomInt(2, 4));
                const rootPower = getRandomInt(2, 4);
                return {
                    expression: rootPower === 2 ? 
                        `log \\sqrt{${baseNum}}` : 
                        `log \\sqrt[${rootPower}]{${baseNum}}`,
                    value: Math.log10(Math.pow(baseNum, 1/rootPower))
                };

            case 6: // 分數運算
                const denomRoot = getRandomInt(2, 4);
                const denomBase = Math.pow(10, getRandomInt(1, 2));
                return {
                    expression: `log \\frac{1}{\\sqrt[${denomRoot}]{${denomBase}}}`,
                    value: -Math.log10(Math.pow(denomBase, 1/denomRoot))
                };

            case 7: // 指數形式的對數
                const simpleNum = getRandomInt(2, 5);
                return {
                    expression: `10^{log ${simpleNum}}`,
                    value: simpleNum
                };

            default:
                return {
                    expression: 'log 10',
                    value: 1
                };
        }
    }

    private generateWrongAnswer(correctAnswer: number, expression: string, difficulty: Difficulty): number {
        const errorTypes = [
            // 1. 正負號錯誤
            () => -correctAnswer,
            
            // 2. 運算順序錯誤
            () => {
                if (difficulty === 3) {
                    // 對於乘法運算，返回部分計算結果的對數
                    const parts = expression.match(/\d+/g);
                    if (parts && parts.length > 1) {
                        return Math.log10(parseInt(parts[0]) * parseInt(parts[1]));
                    }
                }
                return correctAnswer * 1.5;
            },
            
            // 3. 根號處理錯誤
            () => {
                if (difficulty === 5 || difficulty === 6) {
                    return correctAnswer * 2;
                }
                return correctAnswer + 1;
            },

            // 4. 指數形式錯誤
            () => {
                if (difficulty === 7) {
                    const match = expression.match(/log (\d+)/);
                    if (match) {
                        return Math.log10(parseInt(match[1]));
                    }
                }
                return Math.pow(10, correctAnswer);
            }
        ];

        const errorIndex = getRandomInt(0, errorTypes.length - 1);
        const wrongAnswer = errorTypes[errorIndex]();
        
        return Math.abs(wrongAnswer - correctAnswer) < 0.001 ? 
            this.generateWrongAnswer(correctAnswer, expression, difficulty) : 
            roundTo(wrongAnswer, 3);
    }

    private generateExplanation(expression: string, answer: number, difficulty: Difficulty): string {
        const steps: string[] = [];
        
        steps.push(`1. 計算 ${expression}`);

        switch(difficulty) {
            case 1:
            case 2:
                steps.push(`因為是10的${answer}次方`);
                steps.push(`所以答案是${answer}`);
                break;
            case 3:
                const numbers = expression.match(/\d+/g);
                if (numbers) {
                    const product = numbers.reduce((acc, curr) => acc * parseInt(curr), 1);
                    steps.push(`先計算括號內的數值：${numbers.join('×')} = ${product}`);
                    steps.push(`然後計算 log ${product} = ${answer}`);
                }
                break;
            case 4:
                steps.push(`直接得到指數：${answer}`);
                break;
            case 5:
                steps.push('先計算根號內的值');
                steps.push(`然後計算對數，得到${answer}`);
                break;
            case 6:
                steps.push('先計算分母的根號');
                steps.push('再計算分數的值');
                steps.push(`最後計算對數，得到${answer}`);
                break;
            case 7:
                steps.push('使用對數的性質：10^(log x) = x');
                const match = expression.match(/log (\d+)/);
                if (match) {
                    steps.push(`所以答案就是${match[1]}`);
                }
                break;
        }

        return steps.join('<br><br>');
    }

    generate(): IGeneratorOutput {
        const difficulty = this.difficulty as Difficulty;
        const { expression, value } = this.generateExpression(difficulty);
        const correctAnswer = roundTo(value, 3);
        
        // 生成3個錯誤答案
        const wrongAnswers = new Set<string>();
        while (wrongAnswers.size < 3) {
            const wrongAnswer = this.generateWrongAnswer(correctAnswer, expression, difficulty);
            wrongAnswers.add(wrongAnswer.toString());
        }

        return {
            content: `計算 ${expression}`,
            correctAnswer: correctAnswer.toString(),
            wrongAnswers: Array.from(wrongAnswers),
            explanation: this.generateExplanation(expression, correctAnswer, difficulty),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 