import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DEFAULT_CONFIG,
    roundTo
} from '@/utils/mathUtils';

interface AdvancedLogQuestion {
    expression: string;  // LaTeX 格式的表达式
    number: number;      // 实际计算的数值
    result: number;      // 对数计算结果
    steps: string[];     // 计算步骤
}

export default class F4L7_1_1_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L7.1.1_Q2_F_MQ');
    }

    generate(): IGeneratorOutput {
        let question: AdvancedLogQuestion;
        
        // 根据难度生成问题
        switch (this.difficulty) {
            case 1:
                question = this.generateLevel1();
                break;
            case 2:
                question = this.generateLevel2();
                break;
            case 3:
                question = this.generateLevel3();
                break;
            case 4:
                question = this.generateLevel4();
                break;
            case 5:
                question = this.generateLevel5();
                break;
            case 6:
                question = this.generateLevel6();
                break;
            case 7:
                question = this.generateLevel7();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 格式化结果
        const correctAnswer = this.isIntegerResult(question.result) ? 
            question.result.toString() :  // 整数结果直接显示
            roundTo(question.result, 3).toFixed(3); // 非整数结果四舍五入到3位小数

        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(question);

        return {
            content: `\\[${question.expression}\\]`,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers.map(x => 
                this.isIntegerResult(x) ? 
                x.toString() : // 整数结果直接显示
                roundTo(x, 3).toFixed(3)
            ),
            explanation: this.generateExplanation(question),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): AdvancedLogQuestion {
        // 10的正负次方
        const power = getRandomInt(-5, 5);
        return {
            expression: `\\log 10^{${power}}`,
            number: Math.pow(10, power),
            result: power,
            steps: [
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generateLevel2(): AdvancedLogQuestion {
        // 10的整数次方
        const power = getRandomInt(1, 4);
        const number = Math.pow(10, power);
        return {
            expression: `\\log ${number}`,
            number: number,
            result: power,
            steps: [
                `\\log ${number}`,
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generateLevel3(): AdvancedLogQuestion {
        // 生成 -5 到 5 的随机整数作为指数
        const power = getRandomInt(-5, 5);
        const number = Math.pow(10, power);
        
        // 格式化数字，避免使用科学计数法
        const formattedNumber = power >= 0 ? 
            '1' + '0'.repeat(power) :  // 对于正指数，如 100, 1000 等
            '0.' + '0'.repeat(-power - 1) + '1';  // 对于负指数，如 0.01, 0.001 等
        
        return {
            expression: `\\log ${formattedNumber}`,
            number: number,
            result: power,
            steps: [
                `\\log ${formattedNumber}`,
                `\\log 10^{${power}}`,
                `= ${power}`
            ]
        };
    }

    private generateLevel4(): AdvancedLogQuestion {
        // 生成 10^1 到 10^5 的幂
        const targetPower = getRandomInt(1, 5);
        const target = Math.pow(10, targetPower);
        
        // 获取所有可能的因子对
        const possibleFactors = [];
        for (let f1 = 2; f1 <= 9; f1++) {
            for (let f2 = 2; f2 <= 9; f2++) {
                const product = f1 * f2;
                if (target % product === 0) {
                    possibleFactors.push({
                        factor1: f1,
                        factor2: f2,
                        quotient: target / product
                    });
                }
            }
        }
        
        // 随机选择一个因子组合
        const randomIndex = getRandomInt(0, possibleFactors.length - 1);
        const { factor1, factor2, quotient } = possibleFactors[randomIndex];
        
        // 构建表达式和步骤
        let expression: string;
        let steps: string[];
        
        if (quotient === 1) {
            expression = `\\log(${factor1}\\times${factor2})`;
            steps = [
                `\\log(${factor1}\\times${factor2})`,
                `= \\log ${factor1 * factor2}`,
                `= \\log 10^{${targetPower}}`,
                `= ${targetPower}`
            ];
        } else {
            expression = `\\log(${factor1}\\times${factor2}\\times${quotient})`;
            steps = [
                `\\log(${factor1}\\times${factor2}\\times${quotient})`,
                `= \\log ${factor1 * factor2 * quotient}`,
                `= \\log 10^{${targetPower}}`,
                `= ${targetPower}`
            ];
        }
        
        return {
            expression: expression,
            number: target,
            result: targetPower,
            steps: steps
        };
    }

    private generateLevel5(): AdvancedLogQuestion {
        // 根号运算
        const base = getRandomInt(10, 1000);
        const rootPower = getRandomInt(2, 4);
        const result = Math.pow(base, 1/rootPower);
        
        const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
        return {
            expression: `\\log ${rootSymbol}{${base}}`,
            number: result,
            result: Math.log10(result),
            steps: [
                `\\log ${rootSymbol}{${base}}`,
                `= \\log ${base}^{\\frac{1}{${rootPower}}}`,
                `= \\frac{\\log ${base}}{${rootPower}}`,
                `= ${roundTo(Math.log10(result), 3)}`
            ]
        };
    }

    private generateLevel6(): AdvancedLogQuestion {
        // 分数运算
        const base = getRandomInt(10, 100);
        const rootPower = getRandomInt(2, 3);
        const denominator = Math.pow(base, 1/rootPower);
        const result = 1/denominator;
        
        const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
        return {
            expression: `\\log \\frac{1}{${rootSymbol}{${base}}}`,
            number: result,
            result: Math.log10(result),
            steps: [
                `\\log \\frac{1}{${rootSymbol}{${base}}}`,
                `= \\log 1 - \\log ${rootSymbol}{${base}}`,
                `= 0 - \\frac{\\log ${base}}{${rootPower}}`,
                `= ${roundTo(Math.log10(result), 3)}`
            ]
        };
    }

    private generateLevel7(): AdvancedLogQuestion {
        // 指数形式的对数
        const base = getRandomInt(2, 9);
        return {
            expression: `10^{\\log ${base}}`,
            number: base,
            result: base,
            steps: [
                `10^{\\log ${base}}`,
                '根據對數性質：',
                `10^{\\log x} = x`,
                `= ${base}`
            ]
        };
    }

    private generateWrongAnswers(question: AdvancedLogQuestion): number[] {
        const wrongAnswers: number[] = [];
        const correctAnswer = question.result;
        
        while (wrongAnswers.length < 3) {
            let wrongAnswer: number;
            
            // 根据不同的错误类型生成错误答案
            const errorType = getRandomInt(1, 4);
            
            switch (errorType) {
                case 1: // 正负号错误
                    wrongAnswer = -correctAnswer;
                    break;
                    
                case 2: // 运算顺序错误
                    wrongAnswer = correctAnswer + (Math.random() - 0.5);
                    break;
                    
                case 3: // 根号处理错误
                    wrongAnswer = correctAnswer * 2;
                    break;
                    
                case 4: // 指数形式错误
                    wrongAnswer = Math.pow(10, correctAnswer);
                    break;
                
                default:
                    wrongAnswer = correctAnswer + 1;
            }
            
            // 只对非整数结果进行四舍五入
            if (!this.isIntegerResult(wrongAnswer)) {
                wrongAnswer = roundTo(wrongAnswer, 3);
            }
            
            // 确保答案不重复且不等于正确答案
            if (!wrongAnswers.includes(wrongAnswer) && 
                Math.abs(wrongAnswer - correctAnswer) > 0.001) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(question: AdvancedLogQuestion): string {
        const steps: string[] = [];
        
        steps.push('計算步驟：');
        
        // 修改最后一步的结果显示
        const modifiedSteps = question.steps.map((step, index) => {
            if (index === question.steps.length - 1 && step.startsWith('=')) {
                const result = this.isIntegerResult(question.result) ?
                    question.result.toString() : // 整数结果直接显示
                    roundTo(question.result, 3).toFixed(3);
                return `= ${result}`;
            }
            return step;
        });
        
        steps.push(...modifiedSteps.map(step => `\\[${step}\\]`));
        
        return steps.join('\n');
    }

    private isIntegerResult(result: number): boolean {
        return Number.isInteger(result);
    }
} 