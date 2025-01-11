import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DifficultyUtils,
    DEFAULT_CONFIG,
    getNonZeroRandomInt
} from '../../../../utils/mathUtils';

interface LinearEquation {
    leftSide: string;
    rightSide: string;
    solution: number;
}

export default class F1L3_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L3.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        let equation: LinearEquation;
        
        // 根據難度生成方程
        switch (this.difficulty) {
            case 1:
                equation = this.generateLevel1();
                break;
            case 2:
                equation = this.generateLevel2();
                break;
            case 3:
                equation = this.generateLevel3();
                break;
            case 4:
                equation = this.generateLevel4();
                break;
            case 5:
                equation = this.generateLevel5();
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 生成錯誤答案
        const wrongAnswers = this.generateWrongAnswers(equation.solution);

        // 格式化題目和答案
        const content = `\\[${equation.leftSide} = ${equation.rightSide}\\]`;
        const correctAnswer = equation.solution.toString();
        const explanation = this.generateExplanation(equation);

        return {
            content: content,
            correctAnswer: correctAnswer,
            wrongAnswers: wrongAnswers,
            explanation: explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLevel1(): LinearEquation {
        // x ± b = c 形式，係數固定為1
        const solution = getRandomInt(-10, 10);
        const b = getNonZeroRandomInt(-10, 10);
        const c = solution + b;  // a = 1，所以 c = x + b

        return {
            leftSide: `x ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel2(): LinearEquation {
        // ax ± b = c 形式，變量只在左邊
        const solution = getRandomInt(-10, 10);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-10, 10);
        const c = a * solution + b;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel3(): LinearEquation {
        // ax + bx = c 形式，兩個變量項
        const solution = getRandomInt(-8, 8);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-5, 5);
        const c = (a + b) * solution;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatLinearTerm(b, 'x')}`,
            rightSide: c.toString(),
            solution
        };
    }

    private generateLevel4(): LinearEquation {
        // ax ± b = cx ± d 形式，變量在兩邊
        const solution = getRandomInt(-6, 6);
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-10, 10);
        const c = getNonZeroRandomInt(-5, 5);
        const d = (a - c) * solution + b;

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: `${LaTeX.formatLinearTerm(c, 'x')} ${LaTeX.formatConstant(d)}`,
            solution
        };
    }

    private generateLevel5(): LinearEquation {
        // 小數係數：ax + b = cx + d
        const solution = getRandomDecimal(-5, 5, 1);
        const a = getRandomDecimal(0.5, 3, 1);
        const b = getRandomDecimal(-5, 5, 1);
        const c = getRandomDecimal(-2, 2, 1);
        const d = Number((a * solution + b - c * solution).toFixed(1));

        return {
            leftSide: `${LaTeX.formatLinearTerm(a, 'x')} ${LaTeX.formatConstant(b)}`,
            rightSide: `${LaTeX.formatLinearTerm(c, 'x')} ${LaTeX.formatConstant(d)}`,
            solution
        };
    }

    private generateWrongAnswers(correctAnswer: number): string[] {
        const wrongAnswers: string[] = [];
        const isDecimal = this.difficulty === 5;
        
        while (wrongAnswers.length < 3) {
            let wrong: number;
            if (isDecimal) {
                // 對於小數，生成鄰近的錯誤答案
                wrong = Number((correctAnswer + (Math.random() - 0.5) * 2).toFixed(1));
            } else {
                // 對於整數，生成鄰近的整數
                wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
            }
            
            if (!wrongAnswers.includes(wrong.toString()) && wrong !== correctAnswer) {
                wrongAnswers.push(wrong.toString());
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(equation: LinearEquation): string {
        const steps: string[] = [];
        
        if (this.difficulty <= 2) {
            steps.push(
                '1. 移項：將常數項移到等號右邊',
                '2. 計算：解出變量係數',
                '3. 求解：得到變量的值'
            );
        } else if (this.difficulty === 3) {
            steps.push(
                '1. 合併同類項：將變量項合併',
                '2. 計算：得到簡化後的方程',
                '3. 求解：得到變量的值'
            );
        } else if (this.difficulty === 4) {
            steps.push(
                '1. 移項：將所有變量項移到等號左邊',
                '2. 移項：將所有常數項移到等號右邊',
                '3. 合併同類項',
                '4. 求解：得到變量的值'
            );
        } else {
            steps.push(
                '1. 移項：將所有變量項移到等號左邊',
                '2. 移項：將所有常數項移到等號右邊',
                '3. 合併同類項（注意小數計算）',
                '4. 求解：得到變量的值（四捨五入到小數點後一位）'
            );
        }

        return steps.join('\n');
    }
} 