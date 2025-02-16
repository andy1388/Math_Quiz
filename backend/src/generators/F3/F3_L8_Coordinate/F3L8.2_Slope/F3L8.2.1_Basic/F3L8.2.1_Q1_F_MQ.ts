import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, gcd } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
}

interface SlopeQuestion {
    pointA: Point;
    pointB: Point;
    slope: string; // 可能是分数或"不存在"
}

export default class F3L8_2_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F3L8.2.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const wrongAnswers = this.generateWrongAnswers(question);
        const content = this.formatQuestion(question);
        const explanation = this.generateExplanation(question);

        return {
            content,
            correctAnswer: question.slope,
            wrongAnswers,
            explanation,
            type: 'text'
        };
    }

    private firstPoint: Point | null = null;

    private generateQuestion(): SlopeQuestion {
        let pointA: Point, pointB: Point, slope: string;
        this.firstPoint = null;
        
        do {
            pointA = this.generatePoint();
            this.firstPoint = pointA;
            pointB = this.generatePoint();
            slope = this.calculateSlope(pointA, pointB);
        } while (!this.isValidSlope(slope));

        this.firstPoint = null;
        return {
            pointA,
            pointB,
            slope
        };
    }

    private generatePoint(): Point {
        let x: number, y: number;
        const range = this.getCoordinateRange();

        switch (this.difficulty) {
            case 1:
                x = getRandomInt(0, range);
                y = getRandomInt(0, range);
                break;
            case 2:
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            case 3:
                const firstPoint = this.firstPoint;
                if (Math.random() < 0.33) {
                    // 垂直线
                    x = firstPoint ? firstPoint.x : getRandomInt(-range, range);
                    y = getRandomInt(-range, range);
                } else if (Math.random() < 0.5) {
                    // 水平线
                    x = getRandomInt(-range, range);
                    y = firstPoint ? firstPoint.y : getRandomInt(-range, range);
                } else {
                    // 对角线（斜率为±1）
                    x = getRandomInt(-range, range);
                    y = firstPoint ? firstPoint.y + (x - firstPoint.x) : x;
                }
                break;
            default:
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
        }

        return { x, y };
    }

    private getCoordinateRange(): number {
        switch (this.difficulty) {
            case 1: return 5;
            case 2: return 6;
            case 3: return 5;
            default: return 5;
        }
    }

    private calculateSlope(pointA: Point, pointB: Point): string {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        
        // 处理垂直线
        if (dx === 0) {
            return "不存在";
        }
        
        // 处理水平线
        if (dy === 0) {
            return "0";
        }

        // 确保分母为正
        let num = dy;
        let den = dx;
        if (den < 0) {
            num = -num;
            den = -den;
        }
        
        // 约分
        const divisor = gcd(Math.abs(num), Math.abs(den));
        num = num / divisor;
        den = den / divisor;
        
        // 如果分母为1，返回整数
        if (den === 1) {
            return num.toString();
        }
        
        return `\\frac{${num}}{${den}}`;
    }

    private isValidSlope(slope: string): boolean {
        if (slope === "不存在") {
            return this.difficulty === 3;
        }

        if (slope === "0") {
            return this.difficulty === 3;
        }

        let value: number;
        if (slope.includes('\\frac{')) {
            const matches = slope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
            if (matches) {
                const [_, num, den] = matches;
                value = parseInt(num) / parseInt(den);
            } else {
                value = parseFloat(slope);
            }
        } else {
            value = parseFloat(slope);
        }

        switch (this.difficulty) {
            case 1:
                return Number.isInteger(value) && value > 0 && value <= 5;
            case 2:
                return Number.isInteger(value) && Math.abs(value) <= 5;
            case 3:
                return Math.abs(value) === 1;
            default:
                return true;
        }
    }

    private formatQuestion(question: SlopeQuestion): string {
        const formatPoint = (p: Point) => `(${p.x}, ${p.y})`;
        return `求以下兩點所形成直線的斜率：\\[A${formatPoint(question.pointA)}, B${formatPoint(question.pointB)}\\]`;
    }

    private generateWrongAnswers(question: SlopeQuestion): string[] {
        const wrongAnswers: Set<string> = new Set();
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        try {
            // 错误类型1：分子分母顛倒
            if (dy !== 0) {
                const wrong1 = this.calculateSlope(
                    { x: 0, y: 0 },
                    { x: dy, y: dx }
                );
                wrongAnswers.add(wrong1);
            }

            // 错误类型2：y坐标相减顺序错误
            const wrong2 = this.calculateSlope(
                { x: pointA.x, y: pointB.y },
                { x: pointB.x, y: pointA.y }
            );
            wrongAnswers.add(wrong2);

            // 错误类型3：x坐标相减顺序错误
            if (dx !== 0) {
                const wrong3 = this.calculateSlope(
                    { x: pointB.x, y: pointA.y },
                    { x: pointA.x, y: pointB.y }
                );
                wrongAnswers.add(wrong3);
            }

            // 错误类型4：忘记负号
            if (dx !== 0) {
                const wrong4 = this.calculateSlope(
                    { x: 0, y: 0 },
                    { x: Math.abs(dx), y: Math.abs(dy) }
                );
                wrongAnswers.add(wrong4);
            }

            // 错误类型5：分数未化简（如果是分数答案）
            if (question.slope.includes('\\frac{')) {
                const matches = question.slope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                if (matches) {
                    const [_, num, den] = matches;
                    const factor = 2;
                    wrongAnswers.add(`\\frac{${parseInt(num) * factor}}{${parseInt(den) * factor}}`);
                }
            }

        } catch (error) {
            console.error('Error generating wrong answer:', error);
        }

        // 移除无效答案
        wrongAnswers.delete(question.slope);
        wrongAnswers.delete('undefined');
        wrongAnswers.delete('NaN');
        wrongAnswers.delete('Infinity');
        wrongAnswers.delete('-Infinity');

        // 如果还是没有足够的错误答案，添加一些基本的错误答案
        if (wrongAnswers.size < 3) {
            if (question.slope === "不存在") {
                wrongAnswers.add("0");
                wrongAnswers.add("1");
                wrongAnswers.add("-1");
            } else {
                wrongAnswers.add("不存在");
                if (!question.slope.includes('\\frac{')) {
                    const value = parseInt(question.slope);
                    wrongAnswers.add((value + 1).toString());
                    wrongAnswers.add((value - 1).toString());
                }
            }
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateExplanation(question: SlopeQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        // 处理坐标值的显示，负数加括号
        const formatNumber = (num: number): string => {
            return num < 0 ? `(${num})` : num.toString();
        };

        let explanation = `解題步驟：
\\[1.\\space 使用斜率公式：m = \\frac{y_2-y_1}{x_2-x_1}\\]

\\[2.\\space 代入座標：\\]
\\[x_2-x_1 = ${formatNumber(pointB.x)}-${formatNumber(pointA.x)} = ${formatNumber(dx)}\\]
\\[y_2-y_1 = ${formatNumber(pointB.y)}-${formatNumber(pointA.y)} = ${formatNumber(dy)}\\]`;

        if (dx === 0) {
            explanation += `
\\[3.\\space 因為分母為0（x_2-x_1 = 0），表示為鉛直線\\]
\\[4.\\space 鉛直線的斜率不存在\\]

因此，此直線的斜率不存在。`;
        } else {
            explanation += `
\\[3.\\space 計算斜率：\\]
\\[m = \\frac{y_2-y_1}{x_2-x_1} = \\frac{${formatNumber(dy)}}{${formatNumber(dx)}}\\]`;

            if (question.slope.includes('\\frac{')) {
                explanation += `
\\[4.\\space 化簡分數：${question.slope}\\]`;
            } else {
                explanation += `
\\[4.\\space 計算結果：${question.slope}\\]`;
            }

            explanation += `

因此，此直線的斜率為 ${question.slope}。`;
        }

        return explanation;
    }
}