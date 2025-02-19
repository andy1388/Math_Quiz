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
            case 1: // 第一象限
                return {
                    x: getRandomInt(0, 5),
                    y: getRandomInt(0, 5)
                };
            case 2: // 第二象限
                return {
                    x: getRandomInt(-5, 0),
                    y: getRandomInt(0, 5)
                };
            case 3: // 第三象限
                return {
                    x: getRandomInt(-5, 0),
                    y: getRandomInt(-5, 0)
                };
            case 4: // 第四象限
                return {
                    x: getRandomInt(0, 5),
                    y: getRandomInt(-5, 0)
                };
            case 5: // 任意象限（小数）
                const quadrant = getRandomInt(1, 4);
                const x = Number(getRandomDecimal(0, 5, 1));
                const y = Number(getRandomDecimal(0, 5, 1));
                
                switch (quadrant) {
                    case 1: return { x, y };
                    case 2: return { x: -x, y };
                    case 3: return { x: -x, y: -y };
                    case 4: return { x, y: -y };
                    default: return { x, y };
                }
            default:
                throw new Error("Invalid level");
        }
    }

    private generateWrongPoints(correctPoint: Point): Point[] {
        const wrongPoints: Point[] = [];
        
        // 生成3个错误点，分别在不同的象限
        if (this.difficulty === 5) {
            // 对于小数点，我们反转x和y的正负号
            wrongPoints.push(
                { x: -correctPoint.x, y: correctPoint.y },
                { x: correctPoint.x, y: -correctPoint.y },
                { x: -correctPoint.x, y: -correctPoint.y }
            );
        } else {
            // 对于整数，我们反转x和y的正负号
            wrongPoints.push(
                { x: -correctPoint.x, y: correctPoint.y },
                { x: correctPoint.x, y: -correctPoint.y },
                { x: -correctPoint.x, y: -correctPoint.y }
            );
        }
        
        return wrongPoints;
    }

    private generateCoordinateSystem(point: Point, label: string): string {
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
            // 第一步：找 x 坐标
            const step1System = new CoordinateSystem({
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
                labelSize: 14,
                showAllGrids: true
            });

            // 第一步的图形元素
            step1System.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");
            step1System.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
            if (point.x !== 0) {
                // 添加从原点到 x 坐标的红色线段（带箭头）
                const arrowSize = 0.2;
                if (point.x > 0) {
                    // 主线段
                    step1System.addLineSegment(0, 0, point.x, 0, "red", "solid");
                    // 箭头
                    step1System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    step1System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    // 主线段
                    step1System.addLineSegment(0, 0, point.x, 0, "red", "solid");
                    // 箭头
                    step1System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    step1System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            
            // 在 x 轴上标记坐标值
            step1System.addTextWithBackground(point.x, -0.5, `${point.x}`, "red", 18);

            // 第二步：找 y 坐标
            const step2System = new CoordinateSystem({
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
                labelSize: 14,
                showAllGrids: true
            });

            // 添加第二步的图形元素
            const axisLabels2 = [-5, 5];
            step2System.addAxisLabels(axisLabels2, axisLabels2);

            // 添加点
            step2System.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");

            // 保留第一步的红色部分
            if (point.x !== 0) {
                // 主线段
                step2System.addLineSegment(0, 0, point.x, 0, "red", "solid");
                // 箭头
                const arrowSize = 0.2;
                if (point.x > 0) {
                    step2System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    step2System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    step2System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    step2System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
                // x 坐标值
                step2System.addTextWithBackground(point.x, -0.5, `${point.x}`, "red", 18);
            }

            // 添加从点到 y 轴的水平虚线
            step2System.addLineSegment(point.x, point.y, 0, point.y, "green", "dotted");

            // 添加蓝色箭头（从 x 轴到点的垂直线段）
            if (point.y !== 0) {
                // 主线段
                step2System.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
                // 箭头
                const arrowSize = 0.2;
                if (point.y > 0) {
                    step2System.addLineSegment(point.x, point.y, point.x + arrowSize, point.y - arrowSize, "blue", "solid");
                    step2System.addLineSegment(point.x, point.y, point.x - arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    step2System.addLineSegment(point.x, point.y, point.x + arrowSize, point.y + arrowSize, "blue", "solid");
                    step2System.addLineSegment(point.x, point.y, point.x - arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }

            // 在 y 轴上标记坐标值
            step2System.addTextWithBackground(-0.5, point.y, `${point.y}`, "blue", 18);

            return `
解答：正確答案顯示的坐標平面中，點 A 的坐標為 (${point.x}, ${point.y})

【第一步】找出 x 坐標：從點 A 向下引一條垂直虛線（綠色），交 x 軸於 ${point.x}
<div style="text-align: center;">
${step1System.toString()}
</div>

【第二步】找出 y 坐標：從點 A 向左引一條水平虛線（綠色），交 y 軸於 ${point.y}
<div style="text-align: center;">
${step2System.toString()}
</div>

因此，點 A 的坐標為 (${point.x}, ${point.y})
            `.trim();
        }

        // 其他难度的解释保持不变...
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