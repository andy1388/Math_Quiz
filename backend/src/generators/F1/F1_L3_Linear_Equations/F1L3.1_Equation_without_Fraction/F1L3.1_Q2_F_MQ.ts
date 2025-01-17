import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getNonZeroRandomInt,
    formatNumber,
    LaTeX,
} from '@/utils/mathUtils';

interface BracketEquation {
    leftSide: string;
    rightSide: string;
    solution: number;
    a: number;
    b: number;
    c: number;
    d?: number;
    e?: number;
    f?: number;
}

export default class F1L3_1_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L3.1_Q2_F_MQ');
    }

    generate(): IGeneratorOutput {
        let equation: BracketEquation;
        
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

    private generateLevel1(): BracketEquation {
        // a(x + b) = c 形式，係數為正整數
        const solution = getRandomInt(-8, 8);
        const a = getRandomInt(1, 5);  // 正整數係數 1-5
        const b = getNonZeroRandomInt(-5, 5);
        const c = a * (solution + b);  // 計算右邊的值

        return {
            leftSide: `${a === 1 ? '' : a}(x ${formatNumber(b)})`,
            rightSide: c.toString(),
            solution,
            a,
            b,
            c
        };
    }

    private generateLevel2(): BracketEquation {
        // -a(x + b) = c 形式，係數為負整數
        const solution = getRandomInt(-8, 8);
        const a = getNonZeroRandomInt(-5, -1);  // 負整數係數 -5 到 -1
        const b = getNonZeroRandomInt(-5, 5);
        const c = a * (solution + b);  // 計算右邊的值

        return {
            leftSide: `${a === -1 ? '-' : a}(x ${formatNumber(b)})`,
            rightSide: c.toString(),
            solution,
            a,
            b,
            c
        };
    }

    private generateLevel3(): BracketEquation {
        // a(x + b) = c(x + d) 形式
        let a: number, b: number, c: number, d: number;
        let solution: number;
        
        do {
            a = getNonZeroRandomInt(-5, 5);
            c = getNonZeroRandomInt(-5, 5);
            b = getNonZeroRandomInt(-5, 5);
            d = getNonZeroRandomInt(-5, 5);
            
            // 確保方程有唯一解：a-c ≠ 0
            if (a === c) continue;
            
            // 計算解：(cd-ab)/(a-c)
            const tempSolution = (c*d - a*b)/(a-c);
            
            // 確保解是整數且在範圍內
            if (!Number.isInteger(tempSolution) || Math.abs(tempSolution) > 10) continue;
            
            solution = tempSolution;
            break;
            
        } while (true);

        return {
            leftSide: `${a === 1 ? '' : a === -1 ? '-' : formatNumber(a)}(x ${formatNumber(b)})`,
            rightSide: `${c === 1 ? '' : c === -1 ? '-' : formatNumber(c)}(x ${formatNumber(d)})`,
            solution,
            a,
            b,
            c,
            d
        };
    }

    private generateLevel4(): BracketEquation {
        // a(bx + c) = d 形式
        const a = getNonZeroRandomInt(-5, 5);
        const b = getNonZeroRandomInt(-5, 5);
        const c = getNonZeroRandomInt(-5, 5);
        const solution = getRandomInt(-8, 8);
        const d = a * (b * solution + c);

        return {
            leftSide: `${a === 1 ? '' : a === -1 ? '-' : formatNumber(a)}(${b === 1 ? 'x' : b === -1 ? '-x' : b + 'x'} ${formatNumber(c)})`,
            rightSide: d.toString(),
            solution,
            a,
            b,
            c,
            d
        };
    }

    private generateLevel5(): BracketEquation {
        // a(bx + c) = d(ex + f) 形式
        let a: number, b: number, c: number, d: number, e: number, f: number;
        let solution: number;
        
        do {
            a = getNonZeroRandomInt(-5, 5);
            b = getNonZeroRandomInt(-5, 5);
            c = getNonZeroRandomInt(-5, 5);
            d = getNonZeroRandomInt(-5, 5);
            e = getNonZeroRandomInt(-5, 5);
            f = getNonZeroRandomInt(-5, 5);
            
            // 確保係數不會導致分母為0
            if (a*b === d*e) continue;
            
            // 計算解：(df-ac)/(ab-de)
            const tempSolution = (d*f - a*c)/(a*b - d*e);
            
            // 確保解是整數且在範圍內
            if (!Number.isInteger(tempSolution) || Math.abs(tempSolution) > 10) continue;
            
            solution = tempSolution;
            break;
            
        } while (true);

        return {
            leftSide: `${a === 1 ? '' : a === -1 ? '-' : formatNumber(a)}(${b === 1 ? 'x' : b === -1 ? '-x' : b + 'x'} ${formatNumber(c)})`,
            rightSide: `${d === 1 ? '' : d === -1 ? '-' : formatNumber(d)}(${e === 1 ? 'x' : e === -1 ? '-x' : e + 'x'} ${formatNumber(f)})`,
            solution,
            a,
            b,
            c,
            d,
            e,
            f
        };
    }

    private generateWrongAnswers(correctAnswer: number): string[] {
        const wrongAnswers: string[] = [];
        
        while (wrongAnswers.length < 3) {
            // 生成鄰近的錯誤答案
            let wrong = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
            
            // 確保錯誤答案在合理範圍內
            if (Math.abs(wrong) <= 10 && 
                !wrongAnswers.includes(wrong.toString()) && 
                wrong !== correctAnswer) {
                wrongAnswers.push(wrong.toString());
            }
        }
        
        return wrongAnswers;
    }

    private generateExplanation(equation: BracketEquation): string {
        const steps: string[] = [];
        
        if (this.difficulty <= 2) {
            // Level 1-2: ±a(x + b) = c
            const expandedLeft = `${equation.a}x ${formatNumber(equation.a * equation.b)}`;
            steps.push(
                '1. 先把括號展開',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${expandedLeft} = ${equation.c}\\]`,
                '2. 移項：將常數項移到等號右邊',
                `\\[${equation.a}x = ${equation.c} ${formatNumber(-equation.a * equation.b)}\\]`,
                '3. 求解：得到變量的值',
                `\\[x = ${equation.solution}\\]`
            );
        } else if (this.difficulty === 3) {
            // Level 3: a(x + b) = c(x + d)
            if (equation.d === undefined) {
                throw new Error('Level 3 equation missing required parameter d');
            }
            const expandedLeft = `${equation.a}x ${formatNumber(equation.a * equation.b)}`;
            const expandedRight = `${equation.c}x ${formatNumber(equation.c * equation.d)}`;
            const combinedLike = `${equation.a - equation.c}x`;
            const combinedConst = formatNumber(equation.c * equation.d - equation.a * equation.b);
            
            steps.push(
                '1. 把兩邊的括號都展開',
                `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                `\\[${expandedLeft} = ${expandedRight}\\]`,
                '2. 移項：將含x的項移到等號左邊，常數項移到右邊',
                `\\[${combinedLike} = ${combinedConst}\\]`,
                '3. 求解：得到變量的值',
                `\\[x = ${equation.solution}\\]`
            );
        } else {
            // Level 4-5: 複雜括號
            if (equation.d === undefined) {
                throw new Error('Level 4-5 equation missing required parameter d');
            }
            
            const expandedLeft = `${equation.a * equation.b}x ${formatNumber(equation.a * equation.c)}`;
            let expandedRight = equation.d.toString();
            
            if (this.difficulty === 5) {
                if (equation.e === undefined || equation.f === undefined) {
                    throw new Error('Level 5 equation missing required parameters e or f');
                }
                expandedRight = `${equation.d * equation.e}x ${formatNumber(equation.d * equation.f)}`;
                
                steps.push(
                    '1. 展開括號',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[${expandedLeft} = ${expandedRight}\\]`,
                    '2. 移項並合併同類項',
                    `\\[${equation.a * equation.b - equation.d * equation.e}x = ${formatNumber(equation.d * equation.f - equation.a * equation.c)}\\]`,
                    '3. 求解：得到變量的值',
                    `\\[x = ${equation.solution}\\]`
                );
            } else {
                steps.push(
                    '1. 展開括號',
                    `\\[${equation.leftSide} = ${equation.rightSide}\\]`,
                    `\\[${expandedLeft} = ${expandedRight}\\]`,
                    '2. 移項並合併同類項',
                    `\\[${equation.a * equation.b}x = ${equation.d} ${formatNumber(-equation.a * equation.c)}\\]`,
                    '3. 求解：得到變量的值',
                    `\\[x = ${equation.solution}\\]`
                );
            }
        }

        return steps.join('\n');
    }
} 