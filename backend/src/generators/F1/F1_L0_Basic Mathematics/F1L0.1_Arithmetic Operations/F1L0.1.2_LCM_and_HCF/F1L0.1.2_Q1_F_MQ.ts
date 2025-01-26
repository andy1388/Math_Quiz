import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    formatNumber,
    DEFAULT_CONFIG,
    getNonZeroRandomInt
} from '@/utils/mathUtils';

interface NumberOperation {
    numbers: number[];
    result: number | number[];
    type: 'multiples' | 'factors' | 'hcf' | 'lcm' | 'mixed' | 'sum' | 'product';
}

export default class F1L0_1_2_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L0.1.2_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let operation: NumberOperation;
        
        // 根据难度生成问题
        switch (this.difficulty) {
            case 1:
                operation = this.generateLevel1();
                break;
            case 2:
                operation = this.generateLevel2();
                break;
            case 3:
                operation = this.generateLevel3();
                break;
            case 4:
                operation = this.generateLevel4();
                break;
            case 5:
                operation = this.generateLevel5();
                break;
            case 6:
                operation = this.generateLevel6();
                break;
            case 7:
                operation = this.generateLevel7();
                break;
            case 8:
                operation = this.generateLevel8();
                break;
            case 9:
                operation = this.generateLevel9();
                break;
            default:
                throw new Error(`不支援的难度等级: ${this.difficulty}`);
        }

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(operation);

        // 格式化题目和答案
        const content = this.formatQuestion(operation);
        const correctAnswer = this.formatAnswer(operation);
        const explanation = this.generateExplanation(operation);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text'
        };
    }

    private generateLevel1(): NumberOperation {
        // 基础倍数计算
        const number = getRandomInt(10, 30);
        const multiples = Array.from({length: 4}, (_, i) => number * (i + 1));
        
        return {
            numbers: [number],
            result: multiples,
            type: 'multiples'
        };
    }

    private generateLevel2(): NumberOperation {
        // 基础因数计算
        const number = getRandomInt(10, 50);
        const factors = this.getFactors(number);
        
        return {
            numbers: [number],
            result: factors,
            type: 'factors'
        };
    }

    private generateLevel3(): NumberOperation {
        // 基础HCF计算
        const num1 = getRandomInt(2, 30);
        const num2 = getRandomInt(2, 30);
        const hcf = this.calculateHCF(num1, num2);
        
        return {
            numbers: [num1, num2],
            result: [hcf],
            type: 'hcf'
        };
    }

    private generateLevel4(): NumberOperation {
        // 基础LCM计算
        const num1 = getRandomInt(2, 30);
        const num2 = getRandomInt(2, 30);
        const lcm = this.calculateLCM(num1, num2);
        
        return {
            numbers: [num1, num2],
            result: [lcm],
            type: 'lcm'
        };
    }

    private generateLevel5(): NumberOperation {
        // 混合HCF和LCM计算
        const num1 = getRandomInt(2, 40);
        const num2 = getRandomInt(2, 40);
        const hcf = this.calculateHCF(num1, num2);
        const lcm = this.calculateLCM(num1, num2);
        
        return {
            numbers: [num1, num2],
            result: [hcf, lcm],
            type: 'mixed'
        };
    }

    private generateLevel6(): NumberOperation {
        // 较大数字的HCF和LCM
        const num1 = getRandomInt(2, 60);
        const num2 = getRandomInt(2, 60);
        const hcf = this.calculateHCF(num1, num2);
        const lcm = this.calculateLCM(num1, num2);
        
        return {
            numbers: [num1, num2],
            result: [hcf, lcm],
            type: 'mixed'
        };
    }

    private generateLevel7(): NumberOperation {
        // 复杂数字组合
        const num1 = getRandomInt(2, 100);
        const num2 = getRandomInt(2, 100);
        const hcf = this.calculateHCF(num1, num2);
        const lcm = this.calculateLCM(num1, num2);
        
        return {
            numbers: [num1, num2],
            result: [hcf, lcm],
            type: 'mixed'
        };
    }

    private generateLevel8(): NumberOperation {
        // 倍数求和应用
        const number = getRandomInt(2, 12);
        const multiples = Array.from({length: 5}, (_, i) => number * (i + 1));
        const sum = multiples.reduce((a, b) => a + b, 0);
        
        return {
            numbers: [number],
            result: [sum],
            type: 'sum'
        };
    }

    private generateLevel9(): NumberOperation {
        // 因数乘积应用
        const number = getRandomInt(10, 30);
        const factors = this.getFactors(number);
        const product = factors.reduce((a, b) => a * b, 1);
        
        return {
            numbers: [number],
            result: [product],
            type: 'product'
        };
    }

    private calculateHCF(a: number, b: number): number {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    private calculateLCM(a: number, b: number): number {
        return Math.abs(a * b) / this.calculateHCF(a, b);
    }

    private getFactors(n: number): number[] {
        const factors: number[] = [];
        for (let i = 1; i <= n; i++) {
            if (n % i === 0) {
                factors.push(i);
            }
        }
        return factors;
    }

    private formatQuestion(operation: NumberOperation): string {
        switch (operation.type) {
            case 'multiples':
                return `求${operation.numbers[0]}的前四个倍数。`;
            case 'factors':
                return `求${operation.numbers[0]}的所有因数。`;
            case 'hcf':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公约数。`;
            case 'lcm':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最小公倍数。`;
            case 'mixed':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公约数和最小公倍数。`;
            case 'sum':
                return `求${operation.numbers[0]}的前五个倍数之和。`;
            case 'product':
                return `求${operation.numbers[0]}的所有因数的乘积。`;
            default:
                throw new Error('未知的运算类型');
        }
    }

    private formatAnswer(operation: NumberOperation): string {
        if (Array.isArray(operation.result)) {
            if (operation.type === 'mixed') {
                return `HCF=${operation.result[0]}, LCM=${operation.result[1]}`;
            }
            return operation.result.join(', ');
        }
        return operation.result.toString();
    }

    private generateWrongAnswers(operation: NumberOperation): string[] {
        const wrongAnswers: string[] = [];
        const correctAnswer = this.formatAnswer(operation);
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: string;
            
            switch (operation.type) {
                case 'multiples':
                case 'factors':
                    // 生成错误的数列
                    const numbers = (operation.result as number[]).map(n => 
                        n + getNonZeroRandomInt(-2, 2)
                    );
                    wrongAnswer = numbers.join(', ');
                    break;
                    
                case 'hcf':
                case 'lcm':
                    // 生成接近的错误数字
                    const baseNum = (operation.result as number[])[0];
                    wrongAnswer = (baseNum + getNonZeroRandomInt(-5, 5)).toString();
                    break;
                    
                case 'mixed':
                    // 生成错误的HCF和LCM组合
                    const [hcf, lcm] = operation.result as number[];
                    wrongAnswer = `HCF=${hcf + getNonZeroRandomInt(-2, 2)}, LCM=${lcm + getNonZeroRandomInt(-10, 10)}`;
                    break;
                    
                case 'sum':
                case 'product':
                    // 生成接近的错误结果
                    const baseResult = (operation.result as number[])[0];
                    wrongAnswer = (baseResult + getNonZeroRandomInt(-20, 20)).toString();
                    break;
                    
                default:
                    throw new Error('未知的运算类型');
            }
            
            if (!wrongAnswers.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(operation: NumberOperation): string {
        const steps: string[] = [];
        
        switch (operation.type) {
            case 'multiples':
                steps.push(
                    '解题步骤：',
                    `1. ${operation.numbers[0]}的第一个倍数是：${operation.numbers[0]} × 1 = ${operation.numbers[0]}`,
                    `2. ${operation.numbers[0]}的第二个倍数是：${operation.numbers[0]} × 2 = ${operation.numbers[0] * 2}`,
                    `3. ${operation.numbers[0]}的第三个倍数是：${operation.numbers[0]} × 3 = ${operation.numbers[0] * 3}`,
                    `4. ${operation.numbers[0]}的第四个倍数是：${operation.numbers[0]} × 4 = ${operation.numbers[0] * 4}`
                );
                break;
                
            case 'factors':
                steps.push(
                    '解题步骤：',
                    `1. 找出${operation.numbers[0]}的所有因数：`,
                    `2. 从1开始尝试，如果能整除${operation.numbers[0]}，就是因数`,
                    `3. ${operation.numbers[0]}的因数有：${(operation.result as number[]).join(', ')}`
                );
                break;
                
            // ... 其他情况的解释步骤 ...
        }
        
        return steps.join('\n');
    }
} 