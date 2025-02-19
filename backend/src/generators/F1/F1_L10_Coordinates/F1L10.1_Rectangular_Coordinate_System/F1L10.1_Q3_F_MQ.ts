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
                    x: getRandomInt(1, 5),
                    y: getRandomInt(1, 5)
                };
            case 2: // 第二象限
                return {
                    x: getRandomInt(-5, -1),
                    y: getRandomInt(1, 5)
                };
            case 3: // 第三象限
                return {
                    x: getRandomInt(-5, -1),
                    y: getRandomInt(-5, -1)
                };
            case 4: // 第四象限
                return {
                    x: getRandomInt(1, 5),
                    y: getRandomInt(-5, -1)
                };
            case 5: // 任意象限（小数）
                const quadrant = getRandomInt(1, 4);
                const x = Number(getRandomDecimal(0.1, 5, 1));
                const y = Number(getRandomDecimal(0.1, 5, 1));
                
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
        // 生成解释用的坐标系统
        const explainSystem = this.generateCoordinateSystem(point, 'A');
        
        return `
解答：正確答案顯示的坐標平面中，點 A 的位置為 (${point.x}, ${point.y})

在正確的坐標平面中：
1. x 坐標 = ${point.x}${point.x > 0 ? '（正）' : '（負）'}
2. y 坐標 = ${point.y}${point.y > 0 ? '（正）' : '（負）'}
3. 因此點位於${this.getQuadrantName(point)}

<div style="text-align: center;">
${explainSystem}
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