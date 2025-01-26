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
        let num1, num2, hcf;
        do {
            num1 = getRandomInt(2, 30);
            num2 = getRandomInt(2, 30);
            hcf = this.calculateHCF(Math.abs(num1), Math.abs(num2)); // 使用绝对值计算
        } while (hcf <= 0); // 确保HCF为正数
        
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
                return `求${operation.numbers[0]}的前四個倍數。`;
            case 'factors':
                return `求${operation.numbers[0]}的所有因數。`;
            case 'hcf':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公因數。`;
            case 'lcm':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最小公倍數。`;
            case 'mixed':
                return `求${operation.numbers[0]}和${operation.numbers[1]}的最大公因數和最小公倍數。`;
            case 'sum':
                return `求${operation.numbers[0]}的前五個倍數之和。`;
            case 'product':
                return `求${operation.numbers[0]}的所有因數的乘積。`;
            default:
                throw new Error('未知的運算類型');
        }
    }

    private formatAnswer(operation: NumberOperation): string {
        if (Array.isArray(operation.result)) {
            if (operation.type === 'mixed') {
                return `H.C.F.=${operation.result[0]}, L.C.M.=${operation.result[1]}`;
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
                    // 生成更具迷惑性的错误倍数
                    const number = operation.numbers[0];
                    const wrongTypes = [
                        // 从0开始计算的倍数
                        [0, number, number * 2, number * 3],
                        // 跳过一个倍数
                        [number, number * 2, number * 4, number * 5],
                        // 算错一个数字的倍数
                        [number, number * 2, number * 3 + 1, number * 4],
                        // 递增数列（不是倍数）
                        [number, number + number, number + number + number, number + number + number + number]
                    ];
                    const randomType = wrongTypes[Math.floor(Math.random() * wrongTypes.length)];
                    wrongAnswer = randomType.join(', ');
                    break;
                    
                case 'factors':
                    // 生成更具迷惑性的错误因数
                    const factors = operation.result as number[];
                    const wrongFactorTypes = [
                        // 包含不是因数的数
                        [...factors, factors[factors.length - 1] + 1],
                        // 遗漏某个因数
                        factors.filter((_, i) => i !== Math.floor(factors.length / 2)),
                        // 包含附近的数字
                        [...factors.slice(0, -1), factors[factors.length - 1] + 2],
                        // 把某个因数算错
                        factors.map((f, i) => i === factors.length - 2 ? f + 1 : f)
                    ];
                    const randomFactorType = wrongFactorTypes[Math.floor(Math.random() * wrongFactorTypes.length)];
                    wrongAnswer = randomFactorType.join(', ');
                    break;
                    
                case 'hcf':
                case 'lcm':
                    // 生成接近的错误数字
                    const baseNum = (operation.result as number[])[0];
                    wrongAnswer = (baseNum + getNonZeroRandomInt(-5, 5)).toString();
                    break;
                    
                case 'mixed':
                    // 生成错误的HCF和LCM组合，使用新格式
                    const [hcf, lcm] = operation.result as number[];
                    wrongAnswer = `H.C.F.=${hcf + getNonZeroRandomInt(-2, 2)}, L.C.M.=${lcm + getNonZeroRandomInt(-10, 10)}`;
                    break;
                    
                case 'sum':
                case 'product':
                    // 生成接近的错误结果
                    const baseResult = (operation.result as number[])[0];
                    wrongAnswer = (baseResult + getNonZeroRandomInt(-20, 20)).toString();
                    break;
                    
                default:
                    throw new Error('未知的運算類型');
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
                    `1. ${operation.numbers[0]}的第一個倍數是：${operation.numbers[0]} × 1 = ${operation.numbers[0]}<br>`,
                    `2. ${operation.numbers[0]}的第二個倍數是：${operation.numbers[0]} × 2 = ${operation.numbers[0] * 2}<br>`,
                    `3. ${operation.numbers[0]}的第三個倍數是：${operation.numbers[0]} × 3 = ${operation.numbers[0] * 3}<br>`,
                    `4. ${operation.numbers[0]}的第四個倍數是：${operation.numbers[0]} × 4 = ${operation.numbers[0] * 4}`
                );
                break;
                
            case 'factors':
                steps.push(
                    `1. 找出${operation.numbers[0]}的所有因數：<br>`,
                    `2. 從1開始嘗試，如果能整除${operation.numbers[0]}，就是因數<br>`,
                    `3. ${operation.numbers[0]}的因數有：${(operation.result as number[]).join(', ')}`
                );
                break;
                
            case 'hcf':
                steps.push(
                    `1. 找出${operation.numbers[0]}的所有因數：${this.getFactors(operation.numbers[0]).join(', ')}<br>`,
                    `2. 找出${operation.numbers[1]}的所有因數：${this.getFactors(operation.numbers[1]).join(', ')}<br>`,
                    `3. 找出兩數的共同因數<br>`,
                    `4. 最大公因數是：${(operation.result as number[])[0]}`
                );
                break;

            case 'lcm':
                steps.push(
                    `1. 列出${operation.numbers[0]}的倍數：${operation.numbers[0]}, ${operation.numbers[0]*2}, ${operation.numbers[0]*3}, ...<br>`,
                    `2. 列出${operation.numbers[1]}的倍數：${operation.numbers[1]}, ${operation.numbers[1]*2}, ${operation.numbers[1]*3}, ...<br>`,
                    `3. 找出兩數的共同倍數<br>`,
                    `4. 最小公倍數是：${(operation.result as number[])[0]}`
                );
                break;

            case 'mixed':
                const [hcf, lcm] = operation.result as number[];
                steps.push(
                    '求最大公因數：<br>',
                    `1. 找出${operation.numbers[0]}和${operation.numbers[1]}的共同因數<br>`,
                    `2. 最大公因數(H.C.F.)是：${hcf}<br>`,
                    '求最小公倍數：<br>',
                    `3. 找出${operation.numbers[0]}和${operation.numbers[1]}的共同倍數<br>`,
                    `4. 最小公倍數(L.C.M.)是：${lcm}`
                );
                break;

            case 'sum':
                const multiples = Array.from({length: 5}, (_, i) => operation.numbers[0] * (i + 1));
                steps.push(
                    `1. 列出${operation.numbers[0]}的前五個倍數：${multiples.join(', ')}<br>`,
                    `2. 計算這些數的和：${multiples.join(' + ')} = ${(operation.result as number[])[0]}`
                );
                break;

            case 'product':
                const factors = this.getFactors(operation.numbers[0]);
                steps.push(
                    `1. 找出${operation.numbers[0]}的所有因數：${factors.join(', ')}<br>`,
                    `2. 計算這些數的乘積：${factors.join(' × ')} = ${(operation.result as number[])[0]}`
                );
                break;
        }
        
        return steps.join('\n');
    }
} 