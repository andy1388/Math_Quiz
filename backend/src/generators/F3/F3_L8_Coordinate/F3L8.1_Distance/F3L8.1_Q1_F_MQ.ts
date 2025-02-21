import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt, getRandomDecimal, roundTo } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
}

interface CoordinateQuestion {
    pointA: Point;
    pointB: Point;
    distance: number;
}

export default class F3L8_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F3L8.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        const question = this.generateQuestion();
        const content = this.formatQuestion(question);
        const correctAnswer = this.formatAnswer(question.distance, question);
        
        // 生成错误答案
        const wrongAnswers = [
            // 忘记开根号
            `$${roundTo(question.distance * question.distance, 2)}$`,
            // 直接相加
            `$${Math.abs(question.pointB.x - question.pointA.x) + Math.abs(question.pointB.y - question.pointA.y)}$`,
            // 只考虑x方向
            `$\\sqrt{${roundTo(Math.pow(question.pointB.x - question.pointA.x, 2), 2)}}$`,
            // 只考虑y方向
            `$\\sqrt{${roundTo(Math.pow(question.pointB.y - question.pointA.y, 2), 2)}}$`
        ];

        // 过滤重复答案和与正确答案相同的答案
        const uniqueWrongAnswers = wrongAnswers.filter(ans => {
            const cleanAns = ans.replace(/[\$\\sqrt{}]/g, '');
            const cleanCorrect = correctAnswer.replace(/[\$\\sqrt{}]/g, '');
            return cleanAns !== cleanCorrect;
        }).slice(0, 3);

        return {
            content,
            correctAnswer: `$${correctAnswer}$`,
            wrongAnswers: uniqueWrongAnswers,
            explanation: this.generateExplanation(question),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateQuestion(): CoordinateQuestion {
        let pointA: Point, pointB: Point, distance: number;
        
        // 对于难度1，我们应该生成能产生简单平方根的点
        if (this.difficulty === 1) {
            // 预设一些简单的点对，这些点对之间的距离是简单的平方根值
            const simplePoints = [
                { A: {x: 1, y: 0}, B: {x: 2, y: 1} },  // sqrt{2}
                { A: {x: 0, y: 0}, B: {x: 1, y: 1} },  // sqrt{2}
                { A: {x: 2, y: 2}, B: {x: 4, y: 3} },  // sqrt{5}
                { A: {x: 4, y: 0}, B: {x: 3, y: 1} },  // sqrt{2}
                { A: {x: 0, y: 2}, B: {x: 2, y: 0} },  // sqrt{8}
            ];
            
            const selectedPair = simplePoints[Math.floor(Math.random() * simplePoints.length)];
            pointA = selectedPair.A;
            pointB = selectedPair.B;
        } else {
            do {
                pointA = this.generatePoint();
                pointB = this.generatePoint();
                distance = this.calculateDistance(pointA, pointB);
            } while (!this.isValidDistance(distance));
        }

        distance = this.calculateDistance(pointA, pointB);
        
        return {
            pointA,
            pointB,
            distance
        };
    }

    private generatePoint(): Point {
        let x: number, y: number;
        const range = this.getCoordinateRange();
        const decimals = this.getDecimalPlaces();

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
                x = getRandomInt(-range, range);
                y = getRandomInt(-range, range);
                break;
            default:
                x = getRandomDecimal(-range, range, decimals);
                y = getRandomDecimal(-range, range, decimals);
        }

        return { x, y };
    }

    private getCoordinateRange(): number {
        switch (this.difficulty) {
            case 1: return 5;
            case 2: return 6;
            case 3: return 7;
            case 4: return 8;
            case 5: return 9;
            default: return 5;
        }
    }

    private getDecimalPlaces(): number {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3: return 0;
            case 4: return 1;
            case 5: return 2;
            default: return 0;
        }
    }

    private calculateDistance(pointA: Point, pointB: Point): number {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return roundTo(distance, this.getDecimalPlaces());
    }

    private isValidDistance(distance: number): boolean {
        if (distance === 0) return false;
        
        switch (this.difficulty) {
            case 1:
                // 难度1只允许简单的平方根值
                const validRoots = [Math.sqrt(1), Math.sqrt(2), Math.sqrt(4), Math.sqrt(5), Math.sqrt(8)];
                return validRoots.some(root => Math.abs(root - distance) < 0.0001);
            case 2:
                return Number.isInteger(distance) && distance <= 10;
            case 3:
                return distance <= 12;
            case 4:
                return distance <= 15;
            case 5:
                return distance <= 20;
            default:
                return true;
        }
    }

    private formatPoint(point: Point): string {
        const decimals = this.getDecimalPlaces();
        const x = roundTo(point.x, decimals);
        const y = roundTo(point.y, decimals);
        return `(${x}, ${y})`;
    }

    private formatQuestion(question: CoordinateQuestion): string {
        return `求以下兩點之間的距離：\\[A${this.formatPoint(question.pointA)}, B${this.formatPoint(question.pointB)}\\]`;
    }

    private formatAnswer(distance: number, question: CoordinateQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const sumSquared = roundTo(dx * dx + dy * dy, 2);
        
        // 如果是完全平方数，返回简化后的数字
        const sqrtValue = Math.sqrt(sumSquared);
        if (Number.isInteger(sqrtValue)) {
            return `${sqrtValue}`;
        }
        return `\\sqrt{${sumSquared}}`;
    }

    private generateExplanation(question: CoordinateQuestion): string {
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const dxRounded = roundTo(dx, 2);
        const dyRounded = roundTo(dy, 2);
        const dxSquared = roundTo(dx * dx, 2);
        const dySquared = roundTo(dy * dy, 2);
        const sumSquared = roundTo(dx * dx + dy * dy, 2);

        return `解題步驟：
\\[1.\\space 使用兩點距離公式：d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}\\]

\\[2.\\space 代入座標：\\]
\\[x_2-x_1 = ${dxRounded}\\]
\\[y_2-y_1 = ${dyRounded}\\]

\\[3.\\space 計算平方和：\\]
\\[(${dxRounded})^2 + (${dyRounded})^2\\]
\\[= ${dxSquared} + ${dySquared}\\]
\\[= ${sumSquared}\\]

\\[4.\\space 開根號：\\]
\\[d = \\sqrt{${sumSquared}}\\]

\\[因此，兩點之間的距離為\\space \\sqrt{${sumSquared}}。\\]`;
    }

    // 辅助方法：格式化数字（处理完全平方数）
    private formatLatexNumber(value: number): string {
        const squared = roundTo(value * value, 2);
        if (Number.isInteger(Math.sqrt(squared))) {
            return `$${Math.sqrt(squared)}$`;
        }
        return `$\\sqrt{${squared}}$`;
    }
}