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
}

export default class F1L10_1_Q3_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q3_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成正确的点
        const point = this.generatePoint(this.difficulty);
        
        // 生成错误的点（在其他象限）
        const wrongPoints = this.generateWrongPoints(point);
        
        // 生成所有坐标平面的图形
        const allSystems = [
            this.generateCoordinateSystem(point, 'A'),
            ...wrongPoints.map((p, index) => 
                this.generateCoordinateSystem(p, 'A')  // 所有点都使用 'A' 标签
            )
        ];

        const content = `在下列哪一個坐標平面中，點 A 的位置是正確的？
點 A 的坐標為 (${point.x}, ${point.y})`;

        // 让 MC_Maker 处理选项的打乱
        return {
            content,
            correctAnswer: allSystems[0],  // 第一个是正确答案
            wrongAnswers: allSystems.slice(1),  // 其余是错误答案
            explanation: this.generateExplanation(point),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point {
        switch (level) {
            case 1: // x 轴上的点
                return {
                    x: getRandomInt(-5, 5),  // 包含 0
                    y: 0  // 固定在 x 轴上
                };
            
            case 2: // y 轴上的点
                return {
                    x: 0,  // 固定在 y 轴上
                    y: getRandomInt(-5, 5)  // 包含 0
                };
            
            case 3: // 第一象限
                return {
                    x: getRandomInt(0, 5),  // 包含 0
                    y: getRandomInt(0, 5)   // 包含 0
                };
            
            case 4: // 任意象限（整数）
                const quadrant = getRandomInt(1, 4);
                const x = getRandomInt(1, 5);  // 避免 0
                const y = getRandomInt(1, 5);  // 避免 0
                
                switch (quadrant) {
                    case 1: return { x, y };
                    case 2: return { x: -x, y };
                    case 3: return { x: -x, y: -y };
                    case 4: return { x, y: -y };
                    default: return { x, y };
                }
            
            case 5: // 任意象限（小数）
                const decQuadrant = getRandomInt(1, 4);
                const decX = Number(getRandomDecimal(0.1, 5, 1));  // 避免 0
                const decY = Number(getRandomDecimal(0.1, 5, 1));  // 避免 0
                
                switch (decQuadrant) {
                    case 1: return { x: decX, y: decY };
                    case 2: return { x: -decX, y: decY };
                    case 3: return { x: -decX, y: -decY };
                    case 4: return { x: decX, y: -decY };
                    default: return { x: decX, y: decY };
                }
            
            default:
                throw new Error("Invalid level");
        }
    }

    private generateWrongPoints(correctPoint: Point): Point[] {
        const wrongPoints: Point[] = [];
        
        switch (this.difficulty) {
            case 1: // x 轴上的点
                wrongPoints.push(
                    { x: -correctPoint.x, y: 0 },        // 对称点
                    { x: 0, y: correctPoint.x },         // 转到 y 轴
                    { x: 0, y: -correctPoint.x }         // 转到 y 轴负方向
                );
                break;
            
            case 2: // y 轴上的点
                wrongPoints.push(
                    { x: 0, y: -correctPoint.y },        // 对称点
                    { x: correctPoint.y, y: 0 },         // 转到 x 轴
                    { x: -correctPoint.y, y: 0 }         // 转到 x 轴负方向
                );
                break;
            
            case 3: // 第一象限
                wrongPoints.push(
                    { x: -correctPoint.x, y: correctPoint.y },    // 第二象限
                    { x: -correctPoint.x, y: -correctPoint.y },   // 第三象限
                    { x: correctPoint.x, y: -correctPoint.y }     // 第四象限
                );
                break;
            
            case 4: // 任意象限（整数）
            case 5: // 任意象限（小数）
                // 生成其他三个象限的点
                wrongPoints.push(
                    { x: -correctPoint.x, y: correctPoint.y },
                    { x: correctPoint.x, y: -correctPoint.y },
                    { x: -correctPoint.x, y: -correctPoint.y }
                );
                break;
        }
        
        return wrongPoints;
    }

    private generateCoordinateSystem(point: Point, label: string): string {
        if (this.difficulty === 1) {
            // 只显示 x 轴的坐标系统
            const coordSystem = new CoordinateSystem({
                width: 200,
                height: 50,  // 减小高度
                xRange: [-5, 5],
                yRange: [-1, 1],  // 缩小 y 范围
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
                coordSystem.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
            }

            // 添加标签
            for (let x = -5; x <= 5; x++) {
                coordSystem.addText(x, -0.3, `${x}`);
            }

            // 添加点
            coordSystem.addPoint(point.x, 0, "●", "A", 15, -20, "#00cc00");

            return coordSystem.toString();
        } else if (this.difficulty === 2) {
            // 只显示 y 轴的坐标系统
            const coordSystem = new CoordinateSystem({
                width: 50,  // 减小宽度
                height: 200,
                xRange: [-1, 1],  // 缩小 x 范围
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
                coordSystem.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
            }

            // 添加标签
            for (let y = -5; y <= 5; y++) {
                coordSystem.addText(-0.3, y, `${y}`);
            }

            // 添加点
            coordSystem.addPoint(0, point.y, "●", "A", 15, -20, "#00cc00");

            return coordSystem.toString();
        }

        // 其他难度保持原有的完整坐标系统显示
        const range: [number, number] = [-5, 5];
        
        const coordSystem = new CoordinateSystem({
            width: 200,  // 减小尺寸以适应选项框
            height: 200,
            xRange: range,
            yRange: range,
            showGrid: false,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14
        });

        // 只添加 -5 和 5 的标签
        const axisLabels = [-5, 5];
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加刻度线（每个整数位置）
        for (let i = -5; i <= 5; i++) {
            if (i !== 0) {  // 跳过原点
                // 添加 x 轴刻度线
                coordSystem.addLineSegment(i, -0.1, i, 0.1, "black", "solid");
                // 添加 y 轴刻度线
                coordSystem.addLineSegment(-0.1, i, 0.1, i, "black", "solid");
            }
        }

        // 手动添加网格线
        // 垂直网格线（所有整数位置）
        for (let x = -5; x <= 5; x++) {
            if (x !== 0) {  // 跳过 y 轴
                coordSystem.addLineSegment(x, -5, x, 5, "#e0e0e0", "solid");
            }
        }
        // 水平网格线（所有整数位置）
        for (let y = -5; y <= 5; y++) {
            if (y !== 0) {  // 跳过 x 轴
                coordSystem.addLineSegment(-5, y, 5, y, "#e0e0e0", "solid");
            }
        }

        // 添加点
        coordSystem.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");

        // 返回不包含标签的坐标系统
        return coordSystem.toString();
    }

    private generateExplanation(point: Point): string {
        if (this.difficulty === 1) {
            const coordSystem = this.generateCoordinateSystem(point, 'A');
            return `
解答：正確答案顯示的數線中，點 A 的 x 坐標為 ${point.x}

<div style="text-align: center;">
${coordSystem}
</div>

因此，點 A 的 x 坐標為 ${point.x}
            `.trim();
        } else if (this.difficulty === 2) {
            const coordSystem = this.generateCoordinateSystem(point, 'A');
            return `
解答：正確答案顯示的數線中，點 A 的 y 坐標為 ${point.y}

<div style="text-align: center;">
${coordSystem}
</div>

因此，點 A 的 y 坐標為 ${point.y}
            `.trim();
        }

        // 其他难度保持原有的解释方式
        const coordSystem = this.generateCoordinateSystem(point, 'A');
        
        return `
解答：正確答案顯示的坐標平面中，點 A 的位置為 (${point.x}, ${point.y})

在正確的坐標平面中：
1. x 坐標 = ${point.x}${point.x > 0 ? '（正）' : '（負）'}
2. y 坐標 = ${point.y}${point.y > 0 ? '（正）' : '（負）'}
3. 因此點位於${this.getQuadrantName(point)}

<div style="text-align: center;">
${coordSystem}
</div>

其他選項中的點都位於不同的象限，座標不正確。
        `.trim();
    }

    private getQuadrantName(point: Point): string {
        if (point.x > 0 && point.y > 0) return "第一象限";
        if (point.x < 0 && point.y > 0) return "第二象限";
        if (point.x < 0 && point.y < 0) return "第三象限";
        if (point.x > 0 && point.y < 0) return "第四象限";
        if (point.x === 0 && point.y === 0) return "原點";
        if (point.x === 0) return "y 軸上";
        if (point.y === 0) return "x 軸上";
        return "坐標平面上";
    }
} 