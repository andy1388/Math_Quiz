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
    private targetPosition: string = '';  // 新增：用于存储难度4的目标位置

    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q5_F_MQ');
    }

    generate(): IGeneratorOutput {
        if (this.difficulty === 4) {
            // 先随机决定要问的位置
            const positions = ['在 x 軸上', '在 y 軸上', '在原點'];
            this.targetPosition = positions[getRandomInt(0, 2)];
        }

        // 生成点
        const points = this.generatePoint(this.difficulty);
        
        // 生成坐标系统
        const coordSystem = this.generateCoordinateSystem(points);

        // 生成问题内容
        let content;
        if (this.difficulty === 3) {
            const targetQuadrant = getRandomInt(1, 4);
            this.targetQuadrant = targetQuadrant;
            content = `在下面的坐標平面中，哪一個點在第${this.convertToChineseNumber(targetQuadrant)}象限？`;
        } else if (this.difficulty === 4) {
            content = `在下面的坐標平面中，哪一個點${this.targetPosition}？`;
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

    private isPointTooClose(newPoint: {x: number, y: number}, existingPoints: Point[], minDistance: number = 2): boolean {
        return existingPoints.some(point => {
            const dx = point.x - newPoint.x;
            const dy = point.y - newPoint.y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });
    }

    private getRandomPointInQuadrant(quadrant: number, existingPoints: Point[]): {x: number, y: number} {
        let x: number, y: number;
        let attempts = 0;
        const maxAttempts = 20;

        do {
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
            attempts++;
        } while (this.isPointTooClose({x, y}, existingPoints) && attempts < maxAttempts);

        return {x, y};
    }

    private generatePoint(level: number): Point[] {
        let result: Point[] = [];
        
        switch (level) {
            case 1: // 四个象限的整数点
                do {
                    const point = this.getRandomPointInQuadrant(getRandomInt(1, 4), result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: 'A',
                        color: '#00cc00'
                    });
                } while (result.length < 4);
                break;

            case 2: // 包含坐标轴上的点和原点
                const position = getRandomInt(1, 3);
                if (position === 1) { // 在 y 轴上
                    const point = this.getRandomPointInQuadrant(2, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: 'A',
                        color: '#00cc00'
                    });
                } else if (position === 2) { // 在 x 轴上
                    const point = this.getRandomPointInQuadrant(3, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: 'A',
                        color: '#00cc00'
                    });
                } else { // 在原点
                    const point = this.getRandomPointInQuadrant(4, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: 'A',
                        color: '#00cc00'
                    });
                }
                break;

            case 3: // 四个点在不同象限
                const quadrantData = [
                    { label: 'P', color: '#FF0000', quadrant: getRandomInt(1, 4) },
                    { label: 'Q', color: '#00CC00' },
                    { label: 'R', color: '#0000FF' },
                    { label: 'S', color: '#FFA500' }
                ];

                // 记录已使用的象限
                const usedQuadrants = new Set([quadrantData[0].quadrant]);
                
                // 为其他点分配未使用的象限
                for (let i = 1; i < quadrantData.length; i++) {
                    let quadrant;
                    do {
                        quadrant = getRandomInt(1, 4);
                    } while (usedQuadrants.has(quadrant));
                    quadrantData[i].quadrant = quadrant;
                    usedQuadrants.add(quadrant);
                }

                // 根据象限生成具体坐标
                quadrantData.forEach(data => {
                    const point = this.getRandomPointInQuadrant(data.quadrant, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: data.label,
                        color: data.color
                    });
                });
                break;

            case 4: // 特殊位置的点
                if (this.targetPosition === '在 y 軸上') {
                    // 生成在y轴上的点（正确答案）
                    const yAxisY = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在x轴上的点（确保与其他点距离足够）
                    let xAxisX;
                    do {
                        xAxisX = this.getRandomNonZeroInt(-3, 3);
                    } while (Math.abs(xAxisX) < 2);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成第一象限和第三象限的点
                    const quad1Point = this.getRandomPointInQuadrant(1, result);
                    result.push({
                        x: quad1Point.x,
                        y: quad1Point.y,
                        label: 'R',
                        color: '#0000FF'
                    });

                    const quad3Point = this.getRandomPointInQuadrant(3, result);
                    result.push({
                        x: quad3Point.x,
                        y: quad3Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });

                } else if (this.targetPosition === '在 x 軸上') {
                    // 生成在x轴上的点（正确答案）
                    const xAxisX = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在y轴上的点（确保与其他点距离足够）
                    let yAxisY;
                    do {
                        yAxisY = this.getRandomNonZeroInt(-3, 3);
                    } while (Math.abs(yAxisY) < 2);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成第二象限和第四象限的点
                    const quad2Point = this.getRandomPointInQuadrant(2, result);
                    result.push({
                        x: quad2Point.x,
                        y: quad2Point.y,
                        label: 'R',
                        color: '#0000FF'
                    });

                    const quad4Point = this.getRandomPointInQuadrant(4, result);
                    result.push({
                        x: quad4Point.x,
                        y: quad4Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });

                } else { // 问原点
                    // 生成原点（正确答案）
                    const point = this.getRandomPointInQuadrant(4, result);
                    result.push({
                        x: point.x,
                        y: point.y,
                        label: 'P',
                        color: '#FF0000'
                    });

                    // 生成在x轴上的点（非原点）
                    const xAxisX = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: xAxisX,
                        y: 0,
                        label: 'Q',
                        color: '#00CC00'
                    });

                    // 生成在y轴上的点（非原点）
                    const yAxisY = this.getRandomNonZeroInt(-3, 3);
                    result.push({
                        x: 0,
                        y: yAxisY,
                        label: 'R',
                        color: '#0000FF'
                    });

                    // 生成第一象限的点
                    const quad1Point = this.getRandomPointInQuadrant(1, result);
                    result.push({
                        x: quad1Point.x,
                        y: quad1Point.y,
                        label: 'S',
                        color: '#FFA500'
                    });
                }
                break;

            default:
                throw new Error("Invalid difficulty level");
        }

        return result;
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
        if (this.difficulty === 3 || this.difficulty === 4) {
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
        } else if (this.difficulty === 4) {
            // 根据目标位置找出正确的点
            const targetPoint = points.find(p => {
                switch (this.targetPosition) {
                    case '在 x 軸上': return p.y === 0 && p.x !== 0;
                    case '在 y 軸上': return p.x === 0 && p.y !== 0;
                    case '在原點': return p.x === 0 && p.y === 0;
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
        if (this.difficulty === 3 || this.difficulty === 4) {
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
        if (this.difficulty === 2 || this.difficulty === 4) {
            system.addLineSegment(0, -5, 0, 5, "#0000FF", "solid", 3);  // 蓝色y轴
            system.addText(1.3, 4.5, "y-axis", "#0000FF", 24);  // y轴标签
            system.addLineSegment(-5, 0, 5, 0, "#FF0000", "solid", 3);  // 红色x轴
            system.addText(4.5, -0.7, "x-axis", "#FF0000", 24); // x轴标签
            system.addPoint(0, 0, "●", "", 0, 0, "#800080");  // 添加紫色原点
            system.addText(0.5, 0.5, "O", "#800080", 24);    // 紫色原点标记
        }

        let explanation = '';
        
        if (this.difficulty === 4) {
            // 找到正确答案的点
            const correctPoint = points.find(p => {
                switch (this.targetPosition) {
                    case '在 x 軸上': return p.y === 0 && p.x !== 0;
                    case '在 y 軸上': return p.x === 0 && p.y !== 0;
                    case '在原點': return p.x === 0 && p.y === 0;
                    default: return false;
                }
            })!;

            explanation = `點 $${correctPoint.label}(${correctPoint.x}, ${correctPoint.y})$ 的位置判斷：\n\n`;
            
            switch (this.targetPosition) {
                case '在 x 軸上':
                    explanation += `因為點 $${correctPoint.label}$ 的 $y$ 座標為 $0$，且 $x$ 座標不為 $0$，所以點 $${correctPoint.label}$ 在 x 軸上。`;
                    break;
                case '在 y 軸上':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標為 $0$，且 $y$ 座標不為 $0$，所以點 $${correctPoint.label}$ 在 y 軸上。`;
                    break;
                case '在原點':
                    explanation += `因為點 $${correctPoint.label}$ 的 $x$ 座標和 $y$ 座標都為 $0$，所以點 $${correctPoint.label}$ 在原點。`;
                    break;
            }
        } else {
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

            explanation = `點 $${points[0].label}(${points[0].x}, ${points[0].y})$ 的位置判斷：\n\n`;
            
            if (points[0].x === 0 && points[0].y === 0) {
                explanation += `因為 $x = 0$ 且 $y = 0$，所以點 $${points[0].label}$ 在原點。`;
            } else if (points[0].x === 0) {
                explanation += `因為 $x = 0$，所以點 $${points[0].label}$ 在 y 軸上。`;
            } else if (points[0].y === 0) {
                explanation += `因為 $y = 0$，所以點 $${points[0].label}$ 在 x 軸上。`;
            } else {
                explanation += `因為 $x ${points[0].x > 0 ? '> 0' : '< 0'}$ 且 $y ${points[0].y > 0 ? '> 0' : '< 0'}$，\n所以點 $${points[0].label}$ 在${position}。`;
            }
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

    private getRandomNonZeroInt(min: number, max: number): number {
        let result;
        do {
            result = getRandomInt(min, max);
        } while (result === 0);
        return result;
    }
} 