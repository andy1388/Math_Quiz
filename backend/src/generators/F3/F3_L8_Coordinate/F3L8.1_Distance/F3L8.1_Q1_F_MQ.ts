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
        const wrongAnswers = this.generateWrongAnswers(question);
        const content = this.formatQuestion(question);
        const explanation = this.generateExplanation(question);

        return {
            content,
            correctAnswer: this.formatAnswer(question.distance, question),
            wrongAnswers,
            explanation,
            type: 'text'
        };
    }

    private generateQuestion(): CoordinateQuestion {
        let pointA: Point, pointB: Point, distance: number;
        
        do {
            pointA = this.generatePoint();
            pointB = this.generatePoint();
            distance = this.calculateDistance(pointA, pointB);
        } while (!this.isValidDistance(distance));

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
            case 6: return 10;
            case 7: return 12;
            default: return 5;
        }
    }

    private getDecimalPlaces(): number {
        switch (this.difficulty) {
            case 1:
            case 2:
            case 3: return 0;
            case 4: return 1;
            case 5:
            case 6: return 2;
            case 7: return 3;
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
        // 确保距离在合理范围内
        if (distance === 0) return false;
        
        switch (this.difficulty) {
            case 1:
            case 2:
                // 确保是整数
                return Number.isInteger(distance) && distance <= 10;
            case 3:
                return distance <= 12;
            case 4:
                return distance <= 15;
            case 5:
            case 6:
                return distance <= 20;
            case 7:
                return distance <= 25;
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
        return `\\sqrt{${sumSquared}}`;
    }

    private generateWrongAnswers(question: CoordinateQuestion): string[] {
        const wrongAnswers: Set<string> = new Set();
        const { pointA, pointB } = question;
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const sumSquared = roundTo(dx * dx + dy * dy, 2);
        const correctAnswer = `\\sqrt{${sumSquared}}`;

        try {
            // 错误类型1：忘记平方，直接相加绝对值
            const wrong1 = Math.abs(dx) + Math.abs(dy);
            wrongAnswers.add(`\\sqrt{${roundTo(wrong1, 2)}}`);

            // 错误类型2：忘记开根号
            wrongAnswers.add(sumSquared.toString());

            // 错误类型3：将减法写成加法
            const wrong3Squared = Math.pow(pointB.x + pointA.x, 2) + Math.pow(pointB.y + pointA.y, 2);
            wrongAnswers.add(`\\sqrt{${roundTo(wrong3Squared, 2)}}`);

            // 错误类型4：只计算x方向的平方
            const wrong4 = dx * dx;
            wrongAnswers.add(`\\sqrt{${roundTo(wrong4, 2)}}`);

            // 错误类型5：只计算y方向的平方
            const wrong5 = dy * dy;
            wrongAnswers.add(`\\sqrt{${roundTo(wrong5, 2)}}`);

        } catch (error) {
            console.error('Error generating wrong answer:', error);
        }

        // 移除无效答案
        wrongAnswers.delete(correctAnswer);
        wrongAnswers.delete('\\sqrt{0}');
        wrongAnswers.delete('\\sqrt{NaN}');
        wrongAnswers.delete('\\sqrt{Infinity}');

        // 如果还是没有足够的错误答案，添加一些基本的错误答案
        while (wrongAnswers.size < 3) {
            const baseWrong = sumSquared + wrongAnswers.size + 1;
            wrongAnswers.add(`\\sqrt{${baseWrong}}`);
        }

        return Array.from(wrongAnswers).slice(0, 3);
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
} 