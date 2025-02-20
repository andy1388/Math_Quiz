import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface Point {
    x: number;
    y: number;
    label: string;
}

export default class F1L10_1_Q6_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q6_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成点
        const point = this.generatePoint(this.difficulty);
        
        // 生成问题内容
        const content = `在座標平面上標出點 $${point.label}(${point.x}, ${point.y})$，並判斷該點的位置。`;

        // 生成正确答案和错误答案
        const { correctAnswer, wrongAnswers } = this.generateAnswers(point);

        return {
            content,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(point),
            type: 'text'
        };
    }

    private generatePoint(level: number): Point {
        let x: number, y: number;
        
        switch (level) {
            case 1: // 四个象限的整数点
                do {
                    const quadrant = getRandomInt(1, 4);
                    switch (quadrant) {
                        case 1:
                            x = getRandomInt(1, 4);
                            y = getRandomInt(1, 4);
                            break;
                        case 2:
                            x = getRandomInt(-4, -1);
                            y = getRandomInt(1, 4);
                            break;
                        case 3:
                            x = getRandomInt(-4, -1);
                            y = getRandomInt(-4, -1);
                            break;
                        case 4:
                            x = getRandomInt(1, 4);
                            y = getRandomInt(-4, -1);
                            break;
                        default:
                            throw new Error("Invalid quadrant");
                    }
                } while (x === 0 || y === 0);
                break;

            case 2: // 包含坐标轴上的点和原点
                const position = getRandomInt(1, 3);
                if (position === 1) { // 在 y 轴上
                    x = 0;
                    y = this.getRandomNonZeroInt(-4, 4);
                } else if (position === 2) { // 在 x 轴上
                    x = this.getRandomNonZeroInt(-4, 4);
                    y = 0;
                } else { // 在原点
                    x = 0;
                    y = 0;
                }
                break;

            default:
                throw new Error("Invalid difficulty level");
        }

        return {
            x,
            y,
            label: 'A'
        };
    }

    private generateAnswers(point: Point): { correctAnswer: string; wrongAnswers: string[] } {
        let correctAnswer: string;
        let possibleAnswers: string[];

        if (point.x === 0 && point.y === 0) {
            correctAnswer = '在原點';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上', '在原點'];
        } else if (point.x === 0) {
            correctAnswer = '在 y 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (point.y === 0) {
            correctAnswer = '在 x 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (point.x > 0 && point.y > 0) {
            correctAnswer = '第一象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (point.x < 0 && point.y > 0) {
            correctAnswer = '第二象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (point.x < 0 && point.y < 0) {
            correctAnswer = '第三象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else {
            correctAnswer = '第四象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        }

        // 从可能的答案中移除正确答案，然后随机选择3个作为错误答案
        const wrongAnswers = possibleAnswers
            .filter(answer => answer !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return {
            correctAnswer,
            wrongAnswers
        };
    }

    private generateExplanation(point: Point): string {
        let explanation = `點 $${point.label}(${point.x}, ${point.y})$ 的位置判斷：\n\n`;
        
        if (point.x === 0 && point.y === 0) {
            explanation += `因為 $x = 0$ 且 $y = 0$，所以點 $${point.label}$ 在原點。`;
        } else if (point.x === 0) {
            explanation += `因為 $x = 0$，所以點 $${point.label}$ 在 y 軸上。`;
        } else if (point.y === 0) {
            explanation += `因為 $y = 0$，所以點 $${point.label}$ 在 x 軸上。`;
        } else {
            const quadrant = point.x > 0 && point.y > 0 ? '第一' :
                           point.x < 0 && point.y > 0 ? '第二' :
                           point.x < 0 && point.y < 0 ? '第三' : '第四';
            explanation += `因為 $x ${point.x > 0 ? '> 0' : '< 0'}$ 且 $y ${point.y > 0 ? '> 0' : '< 0'}$，\n所以點 $${point.label}$ 在${quadrant}象限。`;
        }

        return explanation;
    }

    private getRandomNonZeroInt(min: number, max: number): number {
        let result;
        do {
            result = getRandomInt(min, max);
        } while (result === 0);
        return result;
    }
} 