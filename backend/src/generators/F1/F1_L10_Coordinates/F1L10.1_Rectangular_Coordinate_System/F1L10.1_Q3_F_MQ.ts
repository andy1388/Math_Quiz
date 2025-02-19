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
                    x: getRandomInt(-5, 5),
                    y: 0  // 固定在 x 轴上
                };
            
            case 2: // y 轴上的点
                return {
                    x: 0,  // 固定在 y 轴上
                    y: getRandomInt(-5, 5)
                };
            
            case 3: // 第一象限
                return {
                    x: getRandomInt(0, 5),  // 包含 0
                    y: getRandomInt(0, 5)   // 包含 0
                };
            
            case 4: // 任意象限（整数）
                const quadrant = getRandomInt(1, 4);
                const x = getRandomInt(0, 5);  // 包含 0
                const y = getRandomInt(0, 5);  // 包含 0
                
                switch (quadrant) {
                    case 1: return { x, y };
                    case 2: return { x: -x, y };
                    case 3: return { x: -x, y: -y };
                    case 4: return { x, y: -y };
                    default: return { x, y };
                }
            
            case 5: // 任意象限（小数）
                const decQuadrant = getRandomInt(1, 4);
                const decX = Number(getRandomDecimal(0, 5, 1));  // 包含 0
                const decY = Number(getRandomDecimal(0, 5, 1));  // 包含 0
                
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
        const usedPoints = new Set<string>();  // 用来追踪已使用的点
        
        // 添加正确点到已使用集合
        usedPoints.add(`${correctPoint.x},${correctPoint.y}`);
        
        const addUniquePoint = (point: Point): boolean => {
            const key = `${point.x},${point.y}`;
            if (!usedPoints.has(key)) {
                usedPoints.add(key);
                wrongPoints.push(point);
                return true;
            }
            return false;
        };

        switch (this.difficulty) {
            case 1: // x 轴上的点
                addUniquePoint({ x: -correctPoint.x, y: 0 });  // 对称点
                while (wrongPoints.length < 3) {
                    const newX = getRandomInt(-5, 5);
                    if (addUniquePoint({ x: newX, y: 0 })) continue;
                }
                break;
            
            case 2: // y 轴上的点
                addUniquePoint({ x: 0, y: -correctPoint.y });  // 对称点
                while (wrongPoints.length < 3) {
                    const newY = getRandomInt(-5, 5);
                    if (addUniquePoint({ x: 0, y: newY })) continue;
                }
                break;
            
            case 3: // 第一象限
                // 尝试添加交换 x 和 y 的点
                addUniquePoint({ x: correctPoint.y, y: correctPoint.x });
                
                // 添加其他随机点直到有3个错误点
                while (wrongPoints.length < 3) {
                    const newX = getRandomInt(0, 5);
                    const newY = getRandomInt(0, 5);
                    addUniquePoint({ x: newX, y: newY });
                }
                break;
            
            case 4: // 任意象限（整数）
            case 5: // 任意象限（小数）
                const isLevel5 = this.difficulty === 5;
                const getCoord = isLevel5 ? 
                    () => Number(getRandomDecimal(0, 5, 1)) : 
                    () => getRandomInt(0, 5);

                while (wrongPoints.length < 3) {
                    const x = getCoord();
                    const y = getCoord();
                    const quadrant = getRandomInt(1, 4);
                    
                    const point = {
                        x: quadrant === 2 || quadrant === 3 ? -x : x,
                        y: quadrant === 3 || quadrant === 4 ? -y : y
                    };
                    
                    addUniquePoint(point);
                }
                break;
        }
        
        return wrongPoints;
    }

    private generateCoordinateSystem(point: Point, label: string): string {
        if (this.difficulty === 1) {
            // 只显示 x 轴的坐标系统
            const coordSystem = new CoordinateSystem({
                width: 400,
                height: 150,
                xRange: [-5, 5],
                yRange: [-2, 2],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showYAxis: false
            });

            // 添加刻度线和标签
            for (let x = -5; x <= 5; x++) {
                // 只在非端点处添加刻度线
                if (x !== 5) {
                    coordSystem.addLineSegment(x, -0.2, x, 0.2, "black", "solid");
                }
                // 添加标签
                coordSystem.addText(x, -0.6, `${x}`);
            }

            // 添加点
            coordSystem.addPoint(point.x, 0, "●", "A", 15, 40, "#00cc00");

            return coordSystem.toString();
        } else if (this.difficulty === 2) {
            // 只显示 y 轴的坐标系统
            const coordSystem = new CoordinateSystem({
                width: 150,      // 适当的宽度
                height: 400,     // 与 level 1 对应
                xRange: [-2, 2], // 给标签足够空间
                yRange: [-5, 5],
                showGrid: false,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14,
                showXAxis: false  // 不显示 x 轴
            });

            // 添加刻度线和标签
            for (let y = -5; y <= 5; y++) {
                // 只在非端点处添加刻度线
                if (y !== 5) {
                    coordSystem.addLineSegment(-0.2, y, 0.2, y, "black", "solid");
                }
                // 添加标签
                coordSystem.addText(-0.6, y, `${y}`);
            }

            // 添加点
            coordSystem.addPoint(0, point.y, "●", "A", -40, 0, "#00cc00");  // 调整标签位置

            return coordSystem.toString();
        }

        if (this.difficulty === 3) {
            // 只显示第一象限
            const coordSystem = new CoordinateSystem({
                width: 200,
                height: 200,
                xRange: [0, 5],  // 只显示正 x 轴部分
                yRange: [0, 5],  // 只显示正 y 轴部分
                showGrid: true,
                gridColor: '#e0e0e0',
                gridOpacity: 0.8,
                axisColor: '#333',
                axisWidth: 1.5,
                showArrows: true,
                labelColor: '#666',
                labelSize: 14
            });

            // 只添加 0 和 5 的标签
            const axisLabels = [0, 5];
            coordSystem.addAxisLabels(axisLabels, axisLabels);

            // 添加点
            coordSystem.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");

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
        if (this.difficulty === 1 || this.difficulty === 2) {
            const coordSystem = this.generateCoordinateSystem(point, 'A');
            return `
解答：正確答案顯示的數線中，點 A 的 ${this.difficulty === 1 ? 'x' : 'y'} 坐標為 ${point.x}

<div style="text-align: center;">
${coordSystem}
</div>

因此，點 A 的 ${this.difficulty === 1 ? 'x' : 'y'} 坐標為 ${point.x}
            `.trim();
        }

        // 第一步：显示 x 坐标
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
            labelSize: 14
        });

        // 添加点
        step1System.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");
        
        // 添加从点到 x 轴的垂直虚线
        step1System.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
        
        // 添加从原点到 x 坐标的红色线段（带箭头）
        if (point.x !== 0) {
            step1System.addLineSegment(0, 0, point.x, 0, "red", "solid");
            // 添加箭头
            const arrowSize = 0.2;
            if (point.x > 0) {
                step1System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                step1System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
            } else {
                step1System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                step1System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
            }
        }
        
        // 在 x 轴上标记坐标值
        step1System.addTextWithBackground(point.x, -0.5, `${point.x}`, "red", 18);

        // 第二步：显示 y 坐标
        const step2System = new CoordinateSystem({
            // 使用相同的配置
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
            labelSize: 14
        });

        // 添加点
        step2System.addPoint(point.x, point.y, "●", "A", 15, -20, "#00cc00");
        
        // 保留第一步的红色线段和箭头
        if (point.x !== 0) {
            step2System.addLineSegment(0, 0, point.x, 0, "red", "solid");
            const arrowSize = 0.2;
            if (point.x > 0) {
                step2System.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                step2System.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
            } else {
                step2System.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                step2System.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
            }
            step2System.addTextWithBackground(point.x, -0.5, `${point.x}`, "red", 18);
        }
        
        // 添加从点到 y 轴的水平虚线
        step2System.addLineSegment(0, point.y, point.x, point.y, "green", "dotted");
        
        // 添加从原点到 y 坐标的蓝色线段和箭头
        if (point.y !== 0) {
            step2System.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
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
解答：正確答案顯示的坐標平面中，點 A 的位置為 (${point.x}, ${point.y})

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