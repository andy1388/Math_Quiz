import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
    formatNumber,
    LaTeX,
    DifficultyUtils,
    DEFAULT_CONFIG,
    getNonZeroRandomInt
} from '@/utils/mathUtils';
import { CoordinateSystem } from '@/utils/coordinates';

interface Point {
    x: number;
    y: number;
}

export default class F1L10_1_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F1L10.1_Q1_F_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成坐标点
        const point = this.generatePoint(this.difficulty);

        // 避免生成太接近坐标轴的点
        if (Math.abs(point.x) < 0.5 || Math.abs(point.y) < 0.5) {
            return this.generate();
        }

        // 生成坐标系图形
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: this.difficulty === 1 ? [0, 5] : [-5, 5],
            yRange: this.difficulty === 1 ? [0, 5] : [-5, 5],
            
            // 自定义网格线
            showGrid: true,
            gridColor: '#f0f0f0',
            gridOpacity: 0.8,
            
            // 自定义坐标轴
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            
            // 自定义标签
            labelColor: '#666',
            labelSize: 14
        });

        // 添加点和标签，使用自定义偏移量
        coordSystem.addPoint(point.x, point.y, "●", `(${point.x}, ${point.y})`, 15, -20);
        
        // 添加虚线 x=2
        coordSystem.addVerticalLine(2, "black", "dotted");

        // 添加线段示例
        coordSystem.addLine([0, 0], [2, 0], "green");

        // 添加斜线和方程，使用自定义偏移量
        coordSystem.addObliqueLine(1, 2, "red", "solid", true, 20, -25);

        // 添加指数函数 y = 2^x
        coordSystem.addFunction(
            x => Math.pow(2, x),  // 函数表达式
            "yellow",             // 颜色
            "solid",             // 线型
            true,                // 显示方程
            "y = 2^x",           // 方程文本
            20,                  // x偏移
            -20                  // y偏移
        );

        // 添加圆 x²+y²-2x-2y-2=0
        coordSystem.addCircle(
            1,                    // 圆心 x 坐标
            1,                    // 圆心 y 坐标
            Math.sqrt(5),         // 半径
            "purple",            // 颜色
            "solid",             // 线型
            true,                // 显示方程
            "x²+y²-2x-2y-2=0",   // 方程文本
            20,                  // x偏移
            -20                  // y偏移
        );

        // 生成题目文本
        return {
            content: `在下面的坐標系中，請寫出標示點的坐標。\n${coordSystem.toString()}`,
            correctAnswer: `(${point.x}, ${point.y})`,
            wrongAnswers: this.generateWrongAnswers(point),
            explanation: `
解答：
1. 從圖中可以看到標示點的位置
2. 沿垂直線找到 x 軸上的刻度，得到 x 坐標為 ${point.x}
3. 沿水平線找到 y 軸上的刻度，得到 y 坐標為 ${point.y}
4. 因此，該點的坐標為 (${point.x}, ${point.y})
            `.trim(),
            type: 'text',
            displayOptions: {
                graph: true  // 使用图形显示
            }
        };
    }

    private generatePoint(level: number): Point {
        switch (level) {
            case 1: // 基礎坐标（第一象限整数）
                return {
                    x: getRandomInt(0, 5),
                    y: getRandomInt(0, 5)
                };
            case 2: // 擴展坐标（四象限整数）
                return {
                    x: getNonZeroRandomInt(-5, 5),
                    y: getNonZeroRandomInt(-5, 5)
                };
            case 3: // 進階坐标（四象限小数）
                return {
                    x: Number(getRandomDecimal(-5, 5, 1)),
                    y: Number(getRandomDecimal(-5, 5, 1))
                };
            default:
                throw new Error("Invalid level");
        }
    }

    private generateWrongAnswers(point: Point): string[] {
        const wrongAnswers: string[] = [];
        const isDecimal = this.difficulty === 3;
        
        while (wrongAnswers.length < 3) {
            let wrongX = isDecimal ? 
                Number(getRandomDecimal(-5, 5, 1)) :
                getNonZeroRandomInt(-5, 5);
            let wrongY = isDecimal ?
                Number(getRandomDecimal(-5, 5, 1)) :
                getNonZeroRandomInt(-5, 5);
            
            const wrongAnswer = `(${wrongX}, ${wrongY})`;
            if (!wrongAnswers.includes(wrongAnswer) && 
                wrongAnswer !== `(${point.x}, ${point.y})`) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        return wrongAnswers;
    }
} 