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
    private targetQuadrant: number = 1;

    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q5_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成点
        const points = this.generatePoint(this.difficulty);
        
        // 生成坐标系统
        const coordSystem = this.generateCoordinateSystem(points);

        // 生成问题内容
        let content;
        if (this.difficulty === 3) {
            // 随机选择要问的象限
            const targetQuadrant = getRandomInt(1, 4);
            this.targetQuadrant = targetQuadrant;  // 保存目标象限供后续使用
            content = `在下面的坐標平面中，哪一個點在第${this.convertToChineseNumber(targetQuadrant)}象限？`;
        } else {
            content = `在下面的坐標平面中，點 $${points[0].label}$ 在哪一個位置？`;
        }

        // 生成正确答案和错误答案
        const { correctAnswer, wrongAnswers } = this.generateAnswers(points);

        return {
            content: `${content}<br>\n${coordSystem.toString()}`,
            correctAnswer,
            wrongAnswers,
            explanation: this.generateExplanation(points),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point[] {
        let x: number, y: number;
        
        switch (level) {
            case 1: // 四个象限的整数点
                do {
                    x = getRandomInt(-5, 5);
                    y = getRandomInt(-5, 5);
                } while (x === 0 || y === 0); // 确保点不在坐标轴上
                return [{
                    x,
                    y,
                    label: 'A',
                    color: '#00cc00'
                }];

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
                return [{
                    x,
                    y,
                    label: 'A',
                    color: '#00cc00'
                }];

            case 3: // 四个点在不同象限
                const points: Point[] = [];
                // 创建四个点的数据
                const pointsData = [
                    {
                        label: 'P',
                        color: '#FF0000',
                        quadrant: getRandomInt(1, 4)  // 随机选择象限 1-4
                    },
                    {
                        label: 'Q',
                        color: '#00CC00'
                    },
                    {
                        label: 'R',
                        color: '#0000FF'
                    },
                    {
                        label: 'S',
                        color: '#FFA500'
                    }
                ];

                // 记录已使用的象限
                const usedQuadrants = new Set([pointsData[0].quadrant]);
                
                // 为其他点分配未使用的象限
                for (let i = 1; i < pointsData.length; i++) {
                    let quadrant;
                    do {
                        quadrant = getRandomInt(1, 4);
                    } while (usedQuadrants.has(quadrant));
                    pointsData[i].quadrant = quadrant;
                    usedQuadrants.add(quadrant);
                }

                // 根据象限生成具体坐标
                pointsData.forEach(pointData => {
                    let x = 0, y = 0;  // 初始化变量
                    switch (pointData.quadrant) {
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
                            throw new Error(`Invalid quadrant: ${pointData.quadrant}`);
                    }
                    points.push({
                        x,
                        y,
                        label: pointData.label,
                        color: pointData.color
                    });
                });

                return points;

            default:
                throw new Error("Invalid difficulty level");
        }
    }

    private generateCoordinateSystem(points: Point[]): CoordinateSystem {
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

        // 添加所有点和标签
        if (this.difficulty === 3) {
            points.forEach(point => {
                coordSystem.addPoint(point.x, point.y, "●", point.label, 0.3, 0.3, point.color);
            });
        } else {
            const offset = this.getLabelOffset(points[0]);
            coordSystem.addPoint(points[0].x, points[0].y, "●", points[0].label, offset.x, offset.y, points[0].color);
        }

        return coordSystem;
    }

    private generateAnswers(points: Point[]): { correctAnswer: string; wrongAnswers: string[] } {
        if (this.difficulty === 3) {
            // 根据目标象限找出正确的点
            const targetPoint = points.find(p => {
                switch (this.targetQuadrant) {
                    case 1: return p.x > 0 && p.y > 0;
                    case 2: return p.x < 0 && p.y > 0;
                    case 3: return p.x < 0 && p.y < 0;
                    case 4: return p.x > 0 && p.y < 0;
                    default: return false;
                }
            });
            const correctAnswer = targetPoint!.label;
            const wrongAnswers = points
                .filter(p => p.label !== correctAnswer)
                .map(p => p.label);
            return { correctAnswer, wrongAnswers };
        }
        
        let correctAnswer: string;
        let possibleAnswers: string[];

        if (points[0].x === 0 && points[0].y === 0) {
            correctAnswer = '在原點';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上', '在原點'];
        } else if (points[0].x === 0) {
            correctAnswer = '在 y 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (points[0].y === 0) {
            correctAnswer = '在 x 軸上';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限', '在 x 軸上', '在 y 軸上'];
        } else if (points[0].x > 0 && points[0].y > 0) {
            correctAnswer = '第一象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (points[0].x < 0 && points[0].y > 0) {
            correctAnswer = '第二象限';
            possibleAnswers = ['第一象限', '第二象限', '第三象限', '第四象限'];
        } else if (points[0].x < 0 && points[0].y < 0) {
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

    private generateExplanation(points: Point[]): string {
        const system = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: [-5, 5] as [number, number],
            yRange: [-5, 5] as [number, number],
            point: points[0],
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, 5],
            showGridLines: true,
            showAxisNumbers: true,
            showAxisTicks: false
        });

        // 添加所有点和标签
        if (this.difficulty === 3) {
            points.forEach(point => {
                system.addPoint(point.x, point.y, "●", point.label, 0.3, 0.3, point.color);
            });
        } else {
            const offset = this.getLabelOffset(points[0]);
            system.addPoint(points[0].x, points[0].y, "●", points[0].label, offset.x, offset.y, points[0].color);
        }

        // 使用更大的 Unicode 字符
        system.addText(3, 3, "Ⅰ", "##FFD700", 48);     // 第一象限
        system.addText(-3, 3, "Ⅱ", "##FFD700", 48);    // 第二象限
        system.addText(-3, -3, "Ⅲ", "##FFD700", 48);   // 第三象限
        system.addText(3, -3, "Ⅳ", "##FFD700", 48);    // 第四象限

        // 添加坐标轴标签和原点标记
        if (this.difficulty === 2) {
                system.addLineSegment(0, -5, 0, 5, "#0000FF", "solid", 3);  // 蓝色y轴
                system.addText(1.3, 4.5, "y-axis", "#0000FF", 24);  // y轴标签
                system.addLineSegment(-5, 0, 5, 0, "#FF0000", "solid", 3);  // 红色x轴
                system.addText(4.5, -0.7, "x-axis", "#FF0000", 24); // x轴标签
                system.addPoint(0, 0, "●", "", 0, 0, "#800080");  // 添加紫色原点
                system.addText(0.5, 0.5, "O", "#800080", 24);    // 紫色原点标记
            }

        let position: string;
        if (points[0].x === 0 && points[0].y === 0) {
            position = '在原點';
        } else if (points[0].x === 0) {
            position = '在 y 軸上';
        } else if (points[0].y === 0) {
            position = '在 x 軸上';
        } else if (points[0].x > 0 && points[0].y > 0) {
            position = '第一象限';
        } else if (points[0].x < 0 && points[0].y > 0) {
            position = '第二象限';
        } else if (points[0].x < 0 && points[0].y < 0) {
            position = '第三象限';
        } else {
            position = '第四象限';
        }

        let explanation = `點 $${points[0].label}(${points[0].x}, ${points[0].y})$ 的位置判斷：\n\n`;
        
        if (points[0].x === 0 && points[0].y === 0) {
            explanation += `因為 $x = 0$ 且 $y = 0$，所以點 $${points[0].label}$ 在原點。`;
        } else if (points[0].x === 0) {
            explanation += `因為 $x = 0$，所以點 $${points[0].label}$ 在 y 軸上。`;
        } else if (points[0].y === 0) {
            explanation += `因為 $y = 0$，所以點 $${points[0].label}$ 在 x 軸上。`;
        } else {
            explanation += `因為 $x ${points[0].x > 0 ? '> 0' : '< 0'}$ 且 $y ${points[0].y > 0 ? '> 0' : '< 0'}$，\n所以點 $${points[0].label}$ 在${position}。`;
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

    private convertToChineseNumber(num: number): string {
        const chineseNumbers = ['一', '二', '三', '四'];
        return chineseNumbers[num - 1];
    }
} 