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
            content: `${content}<br>\n${coordSystem.toString()}`,
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
        if (this.difficulty === 1) {
            // x 轴系统
            const coordSystem = new CoordinateSystem({
                width: 400,
                height: 150,  // 减小高度
                xRange: [-5, 5],
                yRange: [-2, 2],  // 缩小 y 范围
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showYAxis: false  // 不显示 y 轴
            });

            // 添加刻度线
            for (let x = -5; x <= 5; x++) {
                if (x !== 5) {  // 跳过箭头处
                    coordSystem.addLineSegment(x, -0.2, x, 0.2, "black", "solid");
                }
            }

            // 只添加主要标签
            const mainLabels = [-5, 0, 5];
            mainLabels.forEach(x => {
                coordSystem.addText(x, -0.6, `${x}`);
            });

            // 添加点
            points.forEach(point => {
                coordSystem.addPoint(point.x, 0, "●", point.label, 15, 40, "#00cc00");
            });

            return coordSystem;
        }

        if (this.difficulty === 2) {
            // y 轴系统
            const coordSystem = new CoordinateSystem({
                width: 150,   // 减小宽度
                height: 400,
                xRange: [-2, 2],  // 缩小 x 范围
                yRange: [-5, 5],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showXAxis: false  // 不显示 x 轴
            });

            // 添加刻度线
            for (let y = -5; y <= 5; y++) {
                if (y !== 5) {  // 跳过箭头处
                    coordSystem.addLineSegment(-0.2, y, 0.2, y, "black", "solid");
                }
            }

            // 只添加主要标签
            const mainLabels = [-5, 0, 5];
            mainLabels.forEach(y => {
                coordSystem.addText(-0.8, y, `${y}`);
            });

            // 添加点
            points.forEach(point => {
                coordSystem.addPoint(0, point.y, "●", point.label, -40, 0, "#00cc00");
            });

            return coordSystem;
        }

        // 其他难度保持原有的完整坐标系统
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
        if (this.difficulty === 1) {
            const system = CoordinateSystem.createExplanationSystem({
                width: 400,
                height: 200,
                xRange: [-5, 5] as [number, number],
                yRange: [-1, 1] as [number, number],
                point: targetPoint,
                isXAxisOnly: true,
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,  // 不显示网格
                showAxisNumbers: true  // 显示数字
            });

            // 添加所有点
            points.forEach(point => {
                const color = point === targetPoint ? "#ff0000" : "#00cc00";
                system.addPoint(point.x, 0, "●", point.label, 15, 40, color);
            });

            // 添加坐标定位辅助线
            system.addCoordinateLocatingGuides(targetPoint, 1, true, false);

            return `
點 ${targetPoint.label} 的 $x$ 坐標是 <span style="color: red">$${targetPoint.x}$</span>\n
<div style="text-align: center;">\n${system.toString()}\n</div>\n
因此，$x$ 坐標為 ${targetPoint.x} 的點是 ${targetPoint.label}
            `.trim();
        }

        if (this.difficulty === 2) {
            const system = CoordinateSystem.createExplanationSystem({
                width: 200,
                height: 400,
                xRange: [-1, 1] as [number, number],
                yRange: [-5, 5] as [number, number],
                point: targetPoint,
                isYAxisOnly: true,
                axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                showGridLines: false,  // 不显示网格
                showAxisNumbers: true  // 显示数字
            });

            // Add all points first (without labels)
            points.forEach(point => {
                system.addPoint(0, point.y, "●", "", -40, 0, "#00cc00");  // Empty string for label
            });

            // Add labels separately
            points.forEach(point => {
                system.addText(-0.8, point.y, point.label, "#00cc00");
            });

            // Add coordinate guides
            system.addCoordinateLocatingGuides(targetPoint, 1, false, true);

            return `
點 $${targetPoint.label}$ 的 $y$ 坐標是 <span style="color: blue">$${targetPoint.y}$</span>\n
<div style="text-align: center;">\n${system.toString()}\n</div>\n
因此，$y$ 坐標為 ${targetPoint.y} 的點是 $${targetPoint.label}$
            `.trim();
        }

        // level 3-5 的解释
        // 第一步：显示 x 坐标
        const step1System = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: this.difficulty === 3 ? [-1, 6] : [-5, 5] as [number, number],
            yRange: this.difficulty === 3 ? [-1, 6] : [-5, 5] as [number, number],
            point: targetPoint,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            showGridLines: true,
            showAxisNumbers: true
        });

        // 添加所有点
        points.forEach(point => {
            const offset = this.getLabelOffset(point);
            const color = point === targetPoint ? "#ff0000" : "#00cc00";
            step1System.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, color);
        });

        // 添加第一步的辅助线（只显示 x 坐标）
        step1System.addCoordinateLocatingGuides(targetPoint, 1);

        // 第二步：显示 y 坐标
        const step2System = CoordinateSystem.createExplanationSystem({
            width: 400,
            height: 400,
            xRange: this.difficulty === 3 ? [-1, 6] : [-5, 5] as [number, number],
            yRange: this.difficulty === 3 ? [-1, 6] : [-5, 5] as [number, number],
            point: targetPoint,
            showGrid: true,
            showAllGrids: true,
            axisLabels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            showGridLines: true,
            showAxisNumbers: true
        });

        // 添加所有点
        points.forEach(point => {
            const offset = this.getLabelOffset(point);
            const color = point === targetPoint ? "#ff0000" : "#00cc00";
            step2System.addPoint(point.x, point.y, "●", point.label, offset.x, offset.y, color);
        });

        // 添加第二步的辅助线（显示 x 和 y 坐标）
        step2System.addCoordinateLocatingGuides(targetPoint, 2);

        return `
【第一步】找出 $x$ 坐標：從點 $${targetPoint.label}$ 向下引一條垂直虛線（綠色），交 $x$ 軸於 <span style="color: red">$${targetPoint.x}$</span>\n
<div style="text-align: center;">\n${step1System.toString()}\n</div>\n

【第二步】找出 $y$ 坐標：從點 $${targetPoint.label}$ 向左引一條水平虛線（綠色），交 $y$ 軸於 <span style="color: blue">$${targetPoint.y}$</span>\n
<div style="text-align: center;">\n${step2System.toString()}\n</div>\n

因此，點 $${targetPoint.label}$ 的坐標為 $($<span style="color: red">$${targetPoint.x}$</span>$,$ <span style="color: blue">$${targetPoint.y}$</span>$)$
        `.trim();
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