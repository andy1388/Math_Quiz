import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
    label: string;
    color: string;
}

export default class F1L10_1_Q5_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q5_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成点
        const point = this.generatePoint(this.difficulty);
        
        // 生成坐标系统
        const coordSystem = this.generateCoordinateSystem(point);

        // 生成问题内容
        const content = `在下面的坐標平面中，點 $${point.label}$ 在哪一個位置？`;

        // 生成正确答案和错误答案
        const { correctAnswer, wrongAnswers } = this.generateAnswers(point);

        return {
            content: `${content}<br>\n${coordSystem.toString()}`,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(point),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point {
        let x: number, y: number;
        
        switch (level) {
            case 1: // 四个象限的整数点
                do {
                    x = getRandomInt(-5, 5);
                    y = getRandomInt(-5, 5);
                } while (x === 0 || y === 0); // 确保点不在坐标轴上
                break;

            case 2: // 包含坐标轴上的点和原点
                const position = getRandomInt(1, 3);
                if (position === 1) { // 在 y 轴上
                    x = 0;
                    y = getRandomInt(-5, 5);
                } else if (position === 2) { // 在 x 轴上
                    x = getRandomInt(-5, 5);
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
            label: 'A',
            color: '#00cc00'
        };
    }

    private generateCoordinateSystem(point: Point): CoordinateSystem {
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5],
            yRange: [-5, 5],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 16,
            showAllGrids: true
        });

        // 修改坐标轴标签，只显示 -5 和 5
        const axisLabels = [-5, 5];
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加点和标签
        const offset = this.getLabelOffset(point);
        coordSystem.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, point.color);

        return coordSystem;
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
        const system = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true
        });

        // 添加点和标签
        const offset = this.getLabelOffset(point);
        system.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, point.color);

        // 使用更大的 Unicode 字符
        system.addText(3, 3, "Ⅰ", "#0000FF", 48);     // 第一象限
        system.addText(-3, 3, "Ⅱ", "#0000FF", 48);    // 第二象限
        system.addText(-3, -3, "Ⅲ", "#0000FF", 48);   // 第三象限
        system.addText(3, -3, "Ⅳ", "#0000FF", 48);    // 第四象限

        let position: string;
        if (point.x === 0 && point.y === 0) {
            position = '在原點';
        } else if (point.x === 0) {
            position = '在 y 軸上';
        } else if (point.y === 0) {
            position = '在 x 軸上';
        } else if (point.x > 0 && point.y > 0) {
            position = '第一象限';
        } else if (point.x < 0 && point.y > 0) {
            position = '第二象限';
        } else if (point.x < 0 && point.y < 0) {
            position = '第三象限';
        } else {
            position = '第四象限';
        }

        let explanation = `點 $${point.label}(${point.x}, ${point.y})$ 的位置判斷：\n\n`;
        
        if (point.x === 0 && point.y === 0) {
            explanation += `因為 $x = 0$ 且 $y = 0$，所以點 $${point.label}$ 在原點。`;
        } else if (point.x === 0) {
            explanation += `因為 $x = 0$，所以點 $${point.label}$ 在 y 軸上。`;
        } else if (point.y === 0) {
            explanation += `因為 $y = 0$，所以點 $${point.label}$ 在 x 軸上。`;
        } else {
            explanation += `因為 $x ${point.x > 0 ? '> 0' : '< 0'}$ 且 $y ${point.y > 0 ? '> 0' : '< 0'}$，\n所以點 $${point.label}$ 在${position}。`;
        }

        return `
${explanation}\n
<div style="text-align: center;">\n${system.toString()}\n</div>
        `.trim();
    }

    private getLabelOffset(point: Point): { x: number; y: number } {
        const offsetDistance = 15;

        if (point.x === 0 && point.y === 0) {
            return { x: offsetDistance, y: -offsetDistance };  // 原点时标签放在右上
        }

        if (point.x === 0) {
            return { x: offsetDistance, y: 0 };  // y轴上时标签放在右边
        }

        if (point.y === 0) {
            return { x: 0, y: offsetDistance };  // x轴上时标签放在上方
        }

        // 根据象限决定标签位置
        if (point.x > 0 && point.y > 0) {
            return { x: offsetDistance, y: -offsetDistance };  // 第一象限
        }
        if (point.x < 0 && point.y > 0) {
            return { x: -offsetDistance, y: -offsetDistance };  // 第二象限
        }
        if (point.x < 0 && point.y < 0) {
            return { x: -offsetDistance, y: offsetDistance };  // 第三象限
        }
        return { x: offsetDistance, y: offsetDistance };  // 第四象限
    }
} 