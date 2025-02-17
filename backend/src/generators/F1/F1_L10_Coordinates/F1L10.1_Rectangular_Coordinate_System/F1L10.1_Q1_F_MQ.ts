import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import {
    getRandomInt,
    getRandomDecimal,
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

        // 根據難度設置坐標範圍
        const range: [number, number] = this.difficulty === 1 ? [0, 5] : [-5, 5];
        
        // 根據難度設置標籤
        const axisLabels = this.difficulty === 1 
            ? [0, 1, 2, 3, 4, 5]  // level 1 顯示所有整數刻度
            : [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];  // level 2/3 不顯示 0

        // 生成坐标系图形
        const coordSystem = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range as [number, number],
            yRange: range as [number, number],
            showGrid: true,
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showAllGrids: true  // 添加這個選項來顯示完整網格
        });

        // 添加坐標軸上的數字標籤
        coordSystem.addAxisLabels(axisLabels, axisLabels);

        // 添加点和标签，使用字母 A 作為標籤
        coordSystem.addPoint(point.x, point.y, "●", "A", 15, -20);

        // 生成第一步的坐标系（顯示找 x 坐標的輔助線）
        const step1System = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range as [number, number],
            yRange: range as [number, number],
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

        // 添加坐標軸標籤
        step1System.addAxisLabels(axisLabels, axisLabels);
        
        // 添加點 A
        step1System.addPoint(point.x, point.y, "●", "A", 15, -20);
        
        // 添加垂直輔助線（綠色虛線，只到 x 軸）
        step1System.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
        
        // 在 x 軸上添加紅色線段，從原點到 x 坐標
        step1System.addLineSegment(0, 0, point.x, 0, "red", "solid");
        
        // 第一步：添加 x 坐標的標籤（使用紅色）
        step1System.addText(point.x, -0.3, `${point.x}`, "red");

        // 生成第二步的坐标系（顯示找 y 坐標的輔助線）
        const step2System = new CoordinateSystem({
            width: 400,
            height: 400,
            xRange: range as [number, number],
            yRange: range as [number, number],
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

        // 添加坐標軸標籤
        step2System.addAxisLabels(axisLabels, axisLabels);

        // 添加點 A
        step2System.addPoint(point.x, point.y, "●", "A", 15, -20);
        
        // 保留第一步的紅色線段和標籤
        step2System.addLineSegment(0, 0, point.x, 0, "red", "solid");
        step2System.addText(point.x, -0.3, `${point.x}`, "red");
        
        // 添加水平輔助線（綠色虛線，只到點 A）
        step2System.addLineSegment(0, point.y, point.x, point.y, "green", "dotted");
        
        // 添加藍色垂直線段，從 x 軸到點 A
        step2System.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
        
        // 添加 y 坐標的標籤（使用藍色）
        step2System.addText(-0.3, point.y, `${point.y}`, "blue");

        return {
            content: `在下面的坐標系中，請寫出點 A 的坐標。\n${coordSystem.toString()}`,
            correctAnswer: `(${point.x}, ${point.y})`,
            wrongAnswers: this.generateWrongAnswers(point),
            explanation: `
【第一步：找 x 坐標】<br>
1. 從點 A 向下引一條垂直虛線（綠色）<br>
2. 這條線與 x 軸的交點，就是 x 坐標<br>
3. 從刻度可以看出 x = ${point.x}<br>

<div style="text-align: center;">
${step1System.toString()}
</div>

【第二步：找 y 坐標】<br>
1. 從點 A 向左引一條水平虛線（綠色）<br>
2. 這條線與 y 軸的交點，就是 y 坐標<br>
3. 從刻度可以看出 y = ${point.y}<br>

<div style="text-align: center;">
${step2System.toString()}
</div>

因此，點 A 的坐標為 (${point.x}, ${point.y})
            `.trim(),
            type: 'text',
            displayOptions: {
                graph: true
            }
        };
    }

    private generatePoint(level: number): Point {
        switch (level) {
            case 1: // 基礎坐标（第一象限整数）
                return {
                    x: getRandomInt(1, 4),  // 避免 0 和 5
                    y: getRandomInt(1, 4)   // 避免 0 和 5
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