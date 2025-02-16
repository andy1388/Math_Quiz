import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getNonZeroRandomInt, gcd } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
}

interface LineEquation {
    slope: string;     // 斜率，可能是整数或分数
    intercept: string; // y轴截距，可能是整数或分数
    points?: {         // 用于难度5-7
        pointA?: Point;
        pointB?: Point;
    };
}

export default class F4L4_1_Q1_N_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F4L4.1_Q1_N_MQ');
    }

    generate(): IGeneratorOutput {
        const equation = this.generateEquation();
        const wrongAnswers = this.generateWrongAnswers(equation);
        const content = this.formatQuestion(equation);
        const explanation = this.generateExplanation(equation);

        return {
            content,
            correctAnswer: this.formatAnswer(equation),
            wrongAnswers,
            explanation,
            type: 'text'
        };
    }

    private generateEquation(): LineEquation {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3:
                return this.generatePointSlopeEquation();
            case 4:
                return this.generateTwoPointsEquation();
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }
    }

    private calculateIntercept(point: Point, slope: string): string {
        // 将斜率转换为分数形式（分子/分母）
        let slopeNum: number, slopeDen: number;
        if (slope.includes('\\frac{')) {
            const matches = slope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
            if (matches) {
                slopeNum = parseInt(matches[1]);
                slopeDen = parseInt(matches[2]);
            } else {
                slopeNum = parseInt(slope);
                slopeDen = 1;
            }
        } else {
            slopeNum = parseInt(slope);
            slopeDen = 1;
        }

        // 计算截距：c = y₁ - mx₁
        // 为了避免浮点数计算，我们使用分数运算
        // c = y₁ - (slopeNum/slopeDen) * x₁
        // c = (y₁ * slopeDen - slopeNum * x₁) / slopeDen
        const numerator = point.y * slopeDen - slopeNum * point.x;
        const denominator = slopeDen;

        // 约分
        const gcdValue = gcd(Math.abs(numerator), Math.abs(denominator));
        const reducedNum = numerator / gcdValue;
        const reducedDen = denominator / gcdValue;

        // 如果分母为1，直接返回分子
        if (reducedDen === 1) {
            return reducedNum.toString();
        }

        // 如果分母为负数，将负号移到分子
        if (reducedDen < 0) {
            return `\\frac{${-reducedNum}}{${-reducedDen}}`;
        }

        return `\\frac{${reducedNum}}{${reducedDen}}`;
    }

    private generatePointSlopeEquation(): LineEquation {
        let point: Point;
        let slope: string;

        switch (this.difficulty) {
            case 1:
                // 正整数斜率和整数坐标点
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                slope = getNonZeroRandomInt(1, 5).toString();
                break;
            case 2:
                // 分数斜率（简单分数）和整数坐标点
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                // 生成简单分数，分母为2,3,4,5
                const den = getNonZeroRandomInt(2, 5);
                const num = getNonZeroRandomInt(-5, 5);
                slope = `\\frac{${num}}{${den}}`;
                break;
            case 3:
                // 给定点和斜率（整数或分数）
                point = {
                    x: getRandomInt(-5, 5),
                    y: getRandomInt(-5, 5)
                };
                if (Math.random() < 0.5) {
                    slope = getNonZeroRandomInt(-5, 5).toString();
                } else {
                    const den = getNonZeroRandomInt(2, 5);
                    const num = getNonZeroRandomInt(-5, 5);
                    slope = `\\frac{${num}}{${den}}`;
                }
                break;
            default:
                throw new Error(`不支援的難度等級: ${this.difficulty}`);
        }

        // 使用新的方法计算截距
        const intercept = this.calculateIntercept(point, slope);

        return {
            slope,
            intercept,
            points: { pointA: point }
        };
    }

    private generateTwoPointsEquation(): LineEquation {
        let pointA: Point, pointB: Point;
        let slope = '0';  // 初始化斜率
        let intercept = '0';  // 初始化截距

        do {
            // 生成整数坐标点
            pointA = {
                x: getRandomInt(-5, 5),
                y: getRandomInt(-5, 5)
            };
            pointB = {
                x: getRandomInt(-5, 5),
                y: getRandomInt(-5, 5)
            };

            // 计算斜率
            const dx = pointB.x - pointA.x;
            const dy = pointB.y - pointA.y;

            if (dx === 0) continue; // 避免垂直线

            // 计算斜率
            const slopeGcd = gcd(Math.abs(dy), Math.abs(dx));
            let slopeNum = dy / slopeGcd;
            let slopeDen = dx / slopeGcd;

            // 确保分母为正
            if (slopeDen < 0) {
                slopeNum = -slopeNum;
                slopeDen = -slopeDen;
            }

            // 如果分母不是简单分数，继续循环
            if (slopeDen > 5) continue;

            // 格式化斜率
            slope = slopeDen === 1 ? 
                slopeNum.toString() : 
                `\\frac{${slopeNum}}{${slopeDen}}`;

            // 使用新的方法计算截距
            intercept = this.calculateIntercept(pointA, slope);

        } while (!this.isValidEquation(slope, intercept));

        return {
            slope,
            intercept,
            points: { pointA, pointB }
        };
    }

    private generateFraction(maxDenominator: number): string {
        const denominator = getNonZeroRandomInt(2, maxDenominator);
        const numerator = getNonZeroRandomInt(-maxDenominator, maxDenominator);
        const gcdValue = gcd(Math.abs(numerator), denominator);

        if (denominator === gcdValue) {
            return (numerator / gcdValue).toString();
        }
        return `\\frac{${numerator / gcdValue}}{${denominator / gcdValue}}`;
    }

    private evaluateFraction(fraction: string): number {
        if (fraction.includes('\\frac{')) {
            const matches = fraction.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
            if (matches) {
                const [_, num, den] = matches;
                return parseInt(num) / parseInt(den);
            }
        }
        return parseFloat(fraction);
    }

    private formatFraction(value: number): string {
        if (Number.isInteger(value)) {
            // 整数直接返回，不用分数形式
            return value.toString();
        }
        
        const precision = 1000000;
        let numerator = Math.round(value * precision);
        let denominator = precision;
        const gcdValue = gcd(Math.abs(numerator), denominator);
        
        numerator = numerator / gcdValue;
        denominator = denominator / gcdValue;
        
        // 如果分母为1，直接返回分子
        if (denominator === 1) {
            return numerator.toString();
        }
        
        return `\\frac{${numerator}}{${denominator}}`;
    }

    private isValidEquation(slope: string, intercept: string): boolean {
        const m = this.evaluateFraction(slope);
        const c = this.evaluateFraction(intercept);

        switch (this.difficulty) {
            case 1:
                return m > 0 && m <= 5 && Number.isInteger(m) && 
                       Number.isInteger(c) && c > 0 && c <= 10;
            case 2:
                return Math.abs(m) <= 5 && 
                       Number.isInteger(c) && Math.abs(c) <= 10;
            case 3:
            case 4:
                return Math.abs(m) <= 5 && Math.abs(c) <= 10;
            default:
                return true;
        }
    }

    private formatQuestion(equation: LineEquation): string {
        if (this.difficulty <= 3) {
            return `\\[\\text{求通過點 }P(${equation.points?.pointA?.x}, ${equation.points?.pointA?.y})\\text{ 且斜率為 }${equation.slope}\\text{ 的直線方程（斜率截距式）}\\]`;
        } else if (this.difficulty === 4 && equation.points?.pointA && equation.points?.pointB) {
            return `\\[\\text{求通過以下兩點的直線方程（斜率截距式）：}A(${equation.points.pointA.x}, ${equation.points.pointA.y}), B(${equation.points.pointB.x}, ${equation.points.pointB.y})\\]`;
        }
        return '';
    }

    private formatAnswer(equation: LineEquation): string {
        let slope = equation.slope;
        let intercept = equation.intercept;

        // 处理斜率为1或-1的情况
        if (slope === '1') {
            slope = '';
        } else if (slope === '-1') {
            slope = '-';
        }

        // 处理截距为0的情况
        if (intercept === '0') {
            return `y = ${slope}x`;
        }

        // 处理截距的正负号
        const interceptSign = intercept.startsWith('-') ? '' : '+';
        
        return `y = ${slope}x ${interceptSign} ${intercept}`;
    }

    private generateWrongAnswers(equation: LineEquation): string[] {
        const wrongAnswers: Set<string> = new Set();
        const correctAnswer = this.formatAnswer(equation);

        try {
            // 错误类型1：斜率正负号错误
            const wrongSlope = equation.slope.startsWith('-') ? 
                equation.slope.substring(1) : 
                '-' + equation.slope;
            wrongAnswers.add(this.formatAnswer({
                slope: wrongSlope,
                intercept: equation.intercept
            }));

            // 错误类型2：截距正负号错误
            const wrongIntercept = equation.intercept.startsWith('-') ?
                equation.intercept.substring(1) :
                '-' + equation.intercept;
            wrongAnswers.add(this.formatAnswer({
                slope: equation.slope,
                intercept: wrongIntercept
            }));

            // 错误类型3：斜率和截距互换
            wrongAnswers.add(this.formatAnswer({
                slope: equation.intercept,
                intercept: equation.slope
            }));

            // 错误类型4：分数未化简（如果是分数）
            if (equation.slope.includes('\\frac{')) {
                const matches = equation.slope.match(/\\frac\{(-?\d+)\}\{(\d+)\}/);
                if (matches) {
                    const [_, num, den] = matches;
                    wrongAnswers.add(this.formatAnswer({
                        slope: `\\frac{${parseInt(num) * 2}}{${parseInt(den) * 2}}`,
                        intercept: equation.intercept
                    }));
                }
            }

        } catch (error) {
            console.error('Error generating wrong answers:', error);
        }

        // 移除无效答案
        wrongAnswers.delete(correctAnswer);
        wrongAnswers.delete('');

        // 如果还没有足够的错误答案，添加一些基本错误
        while (wrongAnswers.size < 3) {
            const wrongSlope = (this.evaluateFraction(equation.slope) + 
                              (wrongAnswers.size + 1)).toString();
            wrongAnswers.add(this.formatAnswer({
                slope: wrongSlope,
                intercept: equation.intercept
            }));
        }

        return Array.from(wrongAnswers).slice(0, 3);
    }

    private generateExplanation(equation: LineEquation): string {
        let explanation = '解題步驟：\n';

        if (this.difficulty <= 4) {
            explanation += `\\[1.\\space 方程已經是斜率截距式：y = mx + c\\]
\\[2.\\space 其中：\\]
\\[m = ${equation.slope}（斜率）\\]
\\[c = ${equation.intercept}（y軸截距）\\]`;
        } else if (this.difficulty <= 6 && equation.points?.pointA && equation.points?.pointB) {
            const { pointA, pointB } = equation.points;
            const dx = pointB.x - pointA.x;
            const dy = pointB.y - pointA.y;

            explanation += `\\[1.\\space 利用斜率公式：m = \\frac{y_2-y_1}{x_2-x_1}\\]
\\[2.\\space 代入兩點坐標：\\]
\\[m = \\frac{${pointB.y}-${pointA.y}}{${pointB.x}-${pointA.x}} = \\frac{${dy}}{${dx}} = ${equation.slope}\\]
\\[3.\\space 代入點 A(${pointA.x}, ${pointA.y}) 求截距：\\]
\\[${pointA.y} = ${equation.slope}(${pointA.x}) + c\\]
\\[c = ${pointA.y} - ${equation.slope}(${pointA.x}) = ${equation.intercept}\\]`;
        } else if (equation.points?.pointA) {
            const point = equation.points.pointA;
            explanation += `\\[1.\\space 已知斜率 m = ${equation.slope}\\]
\\[2.\\space 代入點 P(${point.x}, ${point.y}) 求截距：\\]
\\[${point.y} = ${equation.slope}(${point.x}) + c\\]
\\[c = ${point.y} - ${equation.slope}(${point.x}) = ${equation.intercept}\\]`;
        }

        explanation += `\n\\[因此，直線方程為：${this.formatAnswer(equation)}\\]`;
        return explanation;
    }
} 