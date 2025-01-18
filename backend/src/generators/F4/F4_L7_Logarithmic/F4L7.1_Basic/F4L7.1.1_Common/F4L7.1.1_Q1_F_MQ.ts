import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, roundTo } from '@/utils/mathUtils';

type Difficulty = 1 | 2 | 3 | 4;

export default class F4L7_1_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L7.1.1_Q1_F_MQ');
    }

    private generateNumber(difficulty: Difficulty): number {
        switch(difficulty) {
            case 1: // 整數 2-9
                return getRandomInt(2, 9);
            case 2: // 特殊數字：1, 0, -1, 10
                const specialCases = [1, 0, -1, 10];
                return specialCases[getRandomInt(0, 3)];
            case 3: // 較大整數 10-9999
                return getRandomInt(10, 9999);
            case 4: // 小數 0.1-19.9
                const isLessThanOne = Math.random() < 0.5;
                if (isLessThanOne) {
                    return roundTo(0.1 + Math.random() * 0.8, 1);
                } else {
                    return roundTo(1.1 + Math.random() * 18.8, 1);
                }
            default:
                return 2;
        }
    }

    private calculateLog(num: number): number | string {
        if (num < 0) return 'Undefined';
        if (num === 0) return 'Undefined';
        return roundTo(Math.log10(num), 3);
    }

    private generateWrongAnswer(correctAnswer: number | string, num: number): number | string {
        // 如果是undefined的情况，生成特殊的错误答案
        if (correctAnswer === 'Undefined') {
            const specialWrongs = [
                '0',
                '-∞',
                num < 0 ? Math.abs(num).toString() : (-num).toString()
            ];
            return specialWrongs[getRandomInt(0, 2)];
        }

        // 如果是特殊值1或0的情况
        if (correctAnswer === '1' || correctAnswer === '0') {
            const specialWrongs = [
                (parseFloat(correctAnswer as string) + 1).toString(),
                (parseFloat(correctAnswer as string) - 1).toString(),
                'Undefined'
            ];
            return specialWrongs[getRandomInt(0, 2)];
        }

        const errorTypes = [
            // 1. 正負號錯誤
            () => roundTo(Math.abs(correctAnswer as number), 3),
            
            // 2. 小數點位置錯誤
            () => roundTo((correctAnswer as number) * 10, 3),
            
            // 3. 計算錯誤（±0.1以內的偏差）
            () => {
                const variation = Math.random() * 0.2 - 0.1;
                return roundTo((correctAnswer as number) + variation, 3);
            }
        ];

        const errorIndex = getRandomInt(0, errorTypes.length - 1);
        const wrongAnswer = errorTypes[errorIndex]();
        
        // 避免无限递归
        const attempts = 0;
        const maxAttempts = 10;
        
        if (Math.abs(wrongAnswer - (correctAnswer as number)) < 0.001) {
            if (attempts >= maxAttempts) {
                return roundTo((correctAnswer as number) + 0.1, 3);
            }
            return this.generateWrongAnswer(correctAnswer, num);
        }
        
        return roundTo(wrongAnswer, 3);
    }

    private generateExplanation(num: number, answer: number | string): string {
        const steps: string[] = [];
        
        steps.push(`1. 計算 log ${num}`);
        
        if (num < 0) {
            steps.push('因為輸入為負數');
            steps.push('因為10的所有次方都不會出現負數');
            steps.push('所以log(-1)為Undefined');
        } else if (num === 0) {
            steps.push('因為輸入為0');
            steps.push('因為10的所有次方都不會出現0');
            steps.push('所以log(0)為Undefined');
        } else if (num === 10) {
            steps.push('因為10是log的底數');
            steps.push('所以log(10) = 1');
        } else if (num === 1) {
            steps.push('因為任何數的log(1)都等於0');
        } else {
            steps.push(num < 1 ? '因為輸入小於1，結果為負數' : '因為輸入大於1，結果為正數');
            steps.push('2. 使用計算機計算');
            steps.push(`3. 答案準確到小數點後3位：${answer}`);
        }

        return steps.join('<br><br>');
    }

    generate(): IGeneratorOutput {
        const difficulty = this.difficulty as Difficulty;
        const num = this.generateNumber(difficulty);
        const correctAnswer = this.calculateLog(num);
        
        // 生成3個錯誤答案
        const wrongAnswers = new Set<string>();
        let attempts = 0;
        const maxAttempts = 20;
        
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            const wrongAnswer = this.generateWrongAnswer(correctAnswer, num);
            if (wrongAnswer !== correctAnswer.toString()) {
                wrongAnswers.add(wrongAnswer.toString());
            }
            attempts++;
        }

        // 如果没有生成足够的错误答案，添加默认错误答案
        if (wrongAnswers.size < 3) {
            if (correctAnswer === 'Undefined') {
                wrongAnswers.add('0');
                wrongAnswers.add('-∞');
                wrongAnswers.add('1');
            } else {
                const defaultWrongs = [
                    roundTo((correctAnswer as number) + 0.1, 3).toString(),
                    roundTo((correctAnswer as number) - 0.1, 3).toString(),
                    roundTo((correctAnswer as number) * 10, 3).toString()
                ];
                for (const wrong of defaultWrongs) {
                    if (wrongAnswers.size < 3) {
                        wrongAnswers.add(wrong);
                    }
                }
            }
        }

        return {
            content: `計算 log ${num}`,
            correctAnswer: correctAnswer.toString(),
            wrongAnswers: Array.from(wrongAnswers),
            explanation: this.generateExplanation(num, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 