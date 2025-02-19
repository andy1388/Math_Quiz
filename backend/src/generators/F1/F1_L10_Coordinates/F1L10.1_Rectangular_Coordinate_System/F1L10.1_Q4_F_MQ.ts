import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    shuffleArray
} from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
    label: string;
}

export default class F1L10_1_Q4_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q4_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成四个点
        const points = this.generatePoints(this.difficulty);
        
        // 随机选择一个点作为目标点
        const targetPoint = points[getRandomInt(0, 3)];
        
        // 生成坐标系统
        const coordSystem = this.generateCoordinateSystem(points);

        // 生成问题内容
        const content = this.generateContent(targetPoint);

        // 生成选项（A、B、C、D）
        const options = ['A', 'B', 'C', 'D'];

        return {
            content: `${content}\n${coordSystem.toString()}`,
            correctAnswer: `$${targetPoint.label}$`,
            wrongAnswers: options.filter(opt => opt !== targetPoint.label).map(opt => `$${opt}$`),
            explanation: this.generateExplanation(points, targetPoint),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoints(level: number): Point[] {
        const points: Point[] = [];
        const labels = ['A', 'B', 'C', 'D'];
        const usedCoords = new Set<string>();

        const addPoint = (x: number, y: number, label: string) => {
            const key = `${x},${y}`;
            if (!usedCoords.has(key)) {
                points.push({ x, y, label });
                usedCoords.add(key);
                return true;
            }
            return false;
        };

        switch (level) {
            case 1: // 只有 x 轴
                while (points.length < 4) {
                    const x = getRandomInt(-5, 5);
                    addPoint(x, 0, labels[points.length]);
                }
                break;

            case 2: // 只有 y 轴
                while (points.length < 4) {
                    const y = getRandomInt(-5, 5);
                    addPoint(0, y, labels[points.length]);
                }
                break;

            case 3: // 第一象限整数点
                while (points.length < 4) {
                    const x = getRandomInt(0, 5);
                    const y = getRandomInt(0, 5);
                    addPoint(x, y, labels[points.length]);
                }
                break;

            case 4: // 四象限整数点
                for (let i = 0; i < 4; i++) {
                    let added = false;
                    while (!added) {
                        const x = getRandomInt(-5, 5);
                        const y = getRandomInt(-5, 5);
                        added = addPoint(x, y, labels[i]);
                    }
                }
                break;

            case 5: // 四象限小数点
                for (let i = 0; i < 4; i++) {
                    let added = false;
                    while (!added) {
                        const x = Number(getRandomDecimal(-5, 5, 1));
                        const y = Number(getRandomDecimal(-5, 5, 1));
                        added = addPoint(x, y, labels[i]);
                    }
                }
                break;
        }

        return points;
    }

    private generateCoordinateSystem(points: Point[]): CoordinateSystem {
        const range: [number, number] = this.difficulty === 3 ? [0, 5] : [-5, 5];
        
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range,
            yRange: range,
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: this.difficulty !== 3
        });

        // 添加坐标轴标签
        const axisLabels = this.difficulty === 3 ? [0, 5] : [-5, 0, 5];
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加所有点
        points.forEach(point => {
            const offset = this.getLabelOffset(point);
            coordSystem.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, "#00cc00");
        });

        return coordSystem;
    }

    private generateContent(targetPoint: Point): string {
        if (this.difficulty === 1) {
            return `在下面的數線上，哪一個點的 $x$ 坐標是 $${targetPoint.x}$？`;
        } else if (this.difficulty === 2) {
            return `在下面的數線上，哪一個點的 $y$ 坐標是 $${targetPoint.y}$？`;
        } else {
            return `在下面的坐標平面中，哪一個點的坐標是 $(${targetPoint.x}, ${targetPoint.y})$？`;
        }
    }

    private generateExplanation(points: Point[], targetPoint: Point): string {
        const explainSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: this.difficulty === 3 ? [0, 5] : [-5, 5],
            yRange: this.difficulty === 3 ? [0, 5] : [-5, 5],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: true
        });

        // 添加所有点
        points.forEach(point => {
            const offset = this.getLabelOffset(point);
            const color = point === targetPoint ? "#ff0000" : "#00cc00";
            explainSystem.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, color);
        });

        // 为目标点添加辅助线
        explainSystem.addCoordinateLocatingGuides(targetPoint, 1);

        let explanation = `解答：\n\n`;
        explanation += `點 ${targetPoint.label} 的坐標是 $($<span style="color: red">${targetPoint.x}</span>$,$ <span style="color: blue">${targetPoint.y}</span>$)$\n\n`;
        explanation += `<div style="text-align: center;">\n${explainSystem.toString()}\n</div>\n\n`;
        explanation += `因此，坐標為 $(${targetPoint.x}, ${targetPoint.y})$ 的點是 ${targetPoint.label}`;

        return explanation;
    }

    private getLabelOffset(point: Point): { x: number; y: number } {
        let offsetX = 15;
        let offsetY = -20;

        if (point.x <= 0) {
            offsetX = -25;
        }

        if (point.y <= 0) {
            offsetY = 25;
        }

        return { x: offsetX, y: offsetY };
    }
} 