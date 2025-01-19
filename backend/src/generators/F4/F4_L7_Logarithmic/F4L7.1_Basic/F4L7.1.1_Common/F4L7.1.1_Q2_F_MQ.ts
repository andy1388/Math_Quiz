import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DEFAULT_CONFIG,
    roundTo,
    ExpressionAnalyzer,
    generateFactorCombinations
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
        
        // 获取所有可能的因子组合
        const possibleFactors = generateFactorCombinations(target, {
            minFactor: 2,
            maxFactor: 9,
            maxQuotient: 9,
            maxFactors: 3  // 对于对数问题，我们限制在3个因子
        });

        // 如果没有找到合适的组合，使用默认的2和5组合
        if (possibleFactors.length === 0) {
            return {
                expression: `\\log(2\\times5\\times${Math.pow(10, targetPower - 1)})`,
                number: target,
                result: targetPower,
                steps: [
                    `\\log(2\\times5\\times${Math.pow(10, targetPower - 1)})`,
                    `= \\log ${target}`,
                    `= \\log 10^{${targetPower}}`,
                    `= ${targetPower}`
                ]
            };
        }

        // 随机选择一个因子组合
        const randomIndex = getRandomInt(0, possibleFactors.length - 1);
        const { factors } = possibleFactors[randomIndex];
        
        // 构建表达式和步骤
        const expression = `\\log(${factors.join('\\times')})`;
        const steps = [
            expression,
            `= \\log ${factors.reduce((a, b) => a * b, 1)}`,
            `= \\log 10^{${targetPower}}`,
            `= ${targetPower}`
        ];
        
        return {
            expression: expression,
            number: target,
            result: targetPower,
            steps: steps
        };
    }

    private generateLevel5(): AdvancedLogQuestion {
        // 生成 10^1 到 10^5 的幂
        const targetPower = getRandomInt(1, 5);
        const base = Math.pow(10, targetPower);
        const rootPower = getRandomInt(2, 4);
        
        // 获取基数的因子组合
        const possibleFactors = generateFactorCombinations(base, {
            minFactor: 2,
            maxFactor: 9,
            maxQuotient: 9,
            maxFactors: 2  // 根号内只用2个因子，避免太复杂
        });

        // 如果没有找到合适的组合，使用默认的2和5组合
        if (possibleFactors.length === 0) {
            const result = Math.pow(base, 1/rootPower);
            const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
            
            return {
                expression: `\\log ${rootSymbol}{${base}}`,
                number: result,
                result: Math.log10(result),
                steps: [
                    `\\log ${rootSymbol}{${base}}`,
                    `= \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
                    `= \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
                    `= \\frac{${targetPower}}{${rootPower}}`,
                    `= ${roundTo(targetPower/rootPower, 3)}`
                ]
            };
        }

        // 随机选择一个因子组合
        const randomIndex = getRandomInt(0, possibleFactors.length - 1);
        const { factors } = possibleFactors[randomIndex];
        const factorExpression = factors.join('\\times');
        
        // 计算结果
        const result = Math.pow(base, 1/rootPower);
        
        // 构建根号符号
        const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
        
        return {
            expression: `\\log ${rootSymbol}{${factorExpression}}`,
            number: result,
            result: Math.log10(result),
            steps: [
                `\\log ${rootSymbol}{${factorExpression}}`,
                `= \\log (${factorExpression})^{\\frac{1}{${rootPower}}}`,
                `= \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
                `= \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
                `= \\frac{${targetPower}}{${rootPower}}`,
                `= ${roundTo(targetPower/rootPower, 3)}`
            ]
        };
    }

    private generateLevel6(): AdvancedLogQuestion {
        // 生成 10^1 到 10^5 的幂
        const targetPower = getRandomInt(1, 5);
        const base = Math.pow(10, targetPower);
        const rootPower = getRandomInt(2, 3);
        
        // 获取基数的因子组合
        const possibleFactors = generateFactorCombinations(base, {
            minFactor: 2,
            maxFactor: 9,
            maxQuotient: 9,
            maxFactors: 2  // 根号内只用2个因子，避免太复杂
        });

        // 如果没有找到合适的组合，使用默认的2和5组合
        if (possibleFactors.length === 0) {
            const result = -targetPower/rootPower;  // 负号是因为是分母
            const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
            
            return {
                expression: `\\log \\frac{1}{${rootSymbol}{${base}}}`,
                number: Math.pow(10, result),
                result: result,
                steps: [
                    `\\log \\frac{1}{${rootSymbol}{${base}}}`,
                    `= \\log 1 - \\log ${rootSymbol}{${base}}`,
                    `= 0 - \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
                    `= 0 - \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
                    `= 0 - \\frac{${targetPower}}{${rootPower}}`,
                    `= ${roundTo(result, 3)}`
                ]
            };
        }

        // 随机选择一个因子组合
        const randomIndex = getRandomInt(0, possibleFactors.length - 1);
        const { factors } = possibleFactors[randomIndex];
        const factorExpression = factors.join('\\times');
        
        // 计算结果
        const result = -targetPower/rootPower;  // 负号是因为是分母
        
        // 构建根号符号
        const rootSymbol = rootPower === 2 ? '\\sqrt' : `\\sqrt[${rootPower}]`;
        
        return {
            expression: `\\log \\frac{1}{${rootSymbol}{${factorExpression}}}`,
            number: Math.pow(10, result),
            result: result,
            steps: [
                `\\log \\frac{1}{${rootSymbol}{${factorExpression}}}`,
                `= \\log 1 - \\log ${rootSymbol}{${factorExpression}}`,
                `= 0 - \\log (${factorExpression})^{\\frac{1}{${rootPower}}}`,
                `= 0 - \\log (10^{${targetPower}})^{\\frac{1}{${rootPower}}}`,
                `= 0 - \\log 10^{\\frac{${targetPower}}{${rootPower}}}`,
                `= 0 - \\frac{${targetPower}}{${rootPower}}`,
                `= ${roundTo(result, 3)}`
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