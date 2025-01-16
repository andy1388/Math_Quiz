import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Angle {
    value: number;      // 角度值
    label?: string;     // 角度标签（如 'x' 或具体数值）
    position: string;   // 角的位置标识（如 'AOB', 'BOC' 等）
}

interface IntersectingLines {
    angles: Angle[];           // 所有角度
    points: string[];         // 点的标识（如 ['A', 'O', 'B', 'C']）
    isVertical?: boolean;     // 是否为垂直线（用于难度3）
}

export default class F1L11_1_Q1_N_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F1/F1_L11_Angles_Lines/F1L11.1_Intersecting_Lines/F1L11.1_Q1_N_MQ');
    }

    generate(): IGeneratorOutput {
        // 生成相交线和角度
        const lines = this.generateLines();
        
        // 生成问题表达式（包含图形的LaTeX代码）
        const expression = this.formatExpression(lines);
        
        // 获取正确答案
        const correctAnswer = this.getAnswer(lines);
        
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(lines);
        
        // 生成解题步骤
        const explanation = this.generateSteps(lines);

        return {
            content: expression,
            correctAnswer: correctAnswer.toString(),
            wrongAnswers,
            explanation,
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }

    private generateLines(): IntersectingLines {
        switch (this.difficulty) {
            case 1:
                return this.generateDifficulty1();
            case 2:
                return this.generateDifficulty2();
            case 3:
                return this.generateDifficulty3();
            case 4:
                return this.generateDifficulty4();
            case 5:
                return this.generateDifficulty5();
            default:
                return this.generateDifficulty1();
        }
    }

    private generateDifficulty1(): IntersectingLines {
        // 生成一个基本角度（20°到160°之间）
        const knownAngle = Math.floor(Math.random() * 141) + 20;
        
        return {
            angles: [
                { value: knownAngle, label: knownAngle.toString(), position: 'AOB' },
                { value: 180 - knownAngle, label: 'x', position: 'BOC' }
            ],
            points: ['A', 'O', 'B', 'C']
        };
    }

    private generateDifficulty2(): IntersectingLines {
        // 生成两个已知角度
        const angle1 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angle2 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angleX = 180 - (angle1 + angle2);  // 确保角度和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angleX, label: 'x', position: 'COD' }
            ],
            points: ['A', 'O', 'B', 'C', 'D']
        };
    }

    private generateDifficulty3(): IntersectingLines {
        // 垂直相交线，一个角为90度
        const angle1 = 90;  // 垂直角
        const angle2 = Math.floor(Math.random() * 71) + 20;  // 20°到90°
        const angleX = 90 - angle2;  // 确保和为90度
        
        return {
            angles: [
                { value: angle1, label: '90', position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angleX, label: 'x', position: 'COD' }
            ],
            points: ['A', 'O', 'B', 'C', 'D'],
            isVertical: true
        };
    }

    private generateDifficulty4(): IntersectingLines {
        // 多角度相交线
        const angle1 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angle2 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angle3 = Math.floor(Math.random() * 41) + 20;  // 20°到60°
        const angleX = 180 - (angle1 + angle2 + angle3);  // 确保总和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angle3, label: angle3.toString(), position: 'COD' },
                { value: angleX, label: 'x', position: 'DOE' }
            ],
            points: ['A', 'O', 'B', 'C', 'D', 'E']
        };
    }

    private generateDifficulty5(): IntersectingLines {
        // 复杂相交线问题
        const angle1 = Math.floor(Math.random() * 31) + 30;  // 30°到60°
        const angle2 = Math.floor(Math.random() * 31) + 30;  // 30°到60°
        const angle3 = 90;  // 垂直角
        const angleX = 180 - (angle1 + angle2);  // 确保和为180°
        
        return {
            angles: [
                { value: angle1, label: angle1.toString(), position: 'AOB' },
                { value: angle2, label: angle2.toString(), position: 'BOC' },
                { value: angle3, label: '90', position: 'COD' },
                { value: angleX, label: 'x', position: 'DOE' }
            ],
            points: ['A', 'O', 'B', 'C', 'D', 'E'],
            isVertical: true
        };
    }

    private formatExpression(lines: IntersectingLines): string {
        // 使用 TikZ 生成图形的 LaTeX 代码
        let tikzCode = '\\begin{tikzpicture}[scale=1.5]\n';
        
        // 绘制相交线
        if (lines.isVertical) {
            // 垂直相交的情况
            tikzCode += '  \\draw[thick] (-2,0) -- (2,0);\n';  // 水平线
            tikzCode += '  \\draw[thick] (0,-2) -- (0,2);\n';  // 垂直线
        } else {
            // 非垂直相交的情况
            tikzCode += '  \\draw[thick] (-2,0) -- (2,0);\n';  // 水平线
            tikzCode += '  \\draw[thick] (-1.5,1.5) -- (1.5,-1.5);\n';  // 倾斜线
        }
        
        // 标注点
        const pointCoords: {[key: string]: [number, number]} = {
            'A': [-2, 0],
            'B': [2, 0],
            'O': [0, 0],
            'C': lines.isVertical ? [0, 2] : [1.5, -1.5],
            'D': lines.isVertical ? [0, -2] : [-1.5, 1.5]
        };
        
        lines.points.forEach(point => {
            const [x, y] = pointCoords[point] || [0, 0];
            tikzCode += `  \\node[point] at (${x},${y}) {${point}};\n`;
        });
        
        // 标注角度
        lines.angles.forEach(angle => {
            const pos = this.getAnglePosition(angle.position, lines.isVertical);
            tikzCode += `  \\node at (${pos.x},${pos.y}) {${angle.label}${angle.label !== 'x' ? '°' : ''}};\n`;
        });
        
        tikzCode += '\\end{tikzpicture}';
        
        return tikzCode;
    }

    private getAnglePosition(position: string, isVertical: boolean = false): {x: number, y: number} {
        // 根据角度位置返回标注坐标
        const positions: {[key: string]: {x: number, y: number}} = {
            'AOB': {x: -0.3, y: 0.3},
            'BOC': {x: 0.3, y: 0.3},
            'COD': {x: 0.3, y: -0.3},
            'DOE': {x: -0.3, y: -0.3}
        };
        
        return positions[position] || {x: 0, y: 0};
    }

    private getAnswer(lines: IntersectingLines): number {
        // 找到标记为 x 的角度并返回其值
        const xAngle = lines.angles.find(angle => angle.label === 'x');
        return xAngle ? xAngle.value : 0;
    }

    private generateWrongAnswers(lines: IntersectingLines): string[] {
        const correctAnswer = this.getAnswer(lines);
        const wrongAnswers = new Set<string>();
        
        // 生成错误答案的策略
        const strategies = [
            // 基本计算错误
            () => (180 - correctAnswer).toString(),  // 补角错误
            () => (correctAnswer + 10).toString(),   // 加10度
            () => (correctAnswer - 10).toString(),   // 减10度
            () => (90).toString(),                  // 假设是直角
            
            // 常见概念错误
            () => (360 - correctAnswer).toString(),  // 误用圆周角
            () => (correctAnswer / 2).toString(),    // 误以为是一半
            () => (180 + correctAnswer).toString(),  // 误加180度
            
            // 运算错误
            () => (Math.floor(correctAnswer * 1.5)).toString(),  // 乘1.5错误
            () => (correctAnswer * 2).toString(),    // 乘2错误
            () => (Math.abs(90 - correctAnswer)).toString(),  // 与90度的差
            
            // 相关角度错误
            () => (lines.angles[0].value).toString(),  // 直接使用其他已知角
            () => (180 - lines.angles[0].value).toString()  // 使用其他角的补角
        ];
        
        // 根据难度选择错误答案策略
        const difficultyStrategies = strategies.slice(0, 3 + this.difficulty * 2);
        
        // 随机使用策略生成错误答案
        while (wrongAnswers.size < 3) {
            const strategy = difficultyStrategies[Math.floor(Math.random() * difficultyStrategies.length)];
            const wrongAnswer = strategy();
            const wrongNum = parseInt(wrongAnswer);
            
            if (wrongAnswer !== correctAnswer.toString() && 
                wrongNum > 0 && 
                wrongNum < 180 && 
                !Array.from(wrongAnswers).includes(wrongAnswer)) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        return Array.from(wrongAnswers);
    }

    private generateSteps(lines: IntersectingLines): string {
        let steps = `解題步驟：<br><br>`;
        
        switch (this.difficulty) {
            case 1:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知一個角為 ${lines.angles[0].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰兩角和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - ${lines.angles[0].value}°<br>` +
                    `   x = ${lines.angles[1].value}°`;
                break;

            case 2:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知兩個角分別為 ${lines.angles[0].value}° 和 ${lines.angles[1].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰三角的和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + ${lines.angles[1].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[2].value}°`;
                break;

            case 3:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線垂直相交<br>` +
                    `   - 垂直角為 90°<br>` +
                    `   - 已知一個角為 ${lines.angles[1].value}°<br><br>` +
                    `2. 應用垂直線原理：<br>` +
                    `   - 垂直相交形成的相鄰兩角和為 90°<br>` +
                    `   - ${lines.angles[1].value}° + x = 90°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 90° - ${lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[2].value}°`;
                break;

            case 4:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩條直線相交<br>` +
                    `   - 已知三個角分別為：<br>` +
                    `     ${lines.angles[0].value}°, ${lines.angles[1].value}°, ${lines.angles[2].value}°<br><br>` +
                    `2. 應用相鄰補角原理：<br>` +
                    `   - 相鄰四角的和為 180°<br>` +
                    `   - ${lines.angles[0].value}° + ${lines.angles[1].value}° + ${lines.angles[2].value}° + x = 180°<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}° + ${lines.angles[2].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value + lines.angles[2].value}°<br>` +
                    `   x = ${lines.angles[3].value}°`;
                break;

            case 5:
                steps += `1. 觀察圖形：<br>` +
                    `   - 兩組相交線<br>` +
                    `   - 已知角度：<br>` +
                    `     ${lines.angles[0].value}°, ${lines.angles[1].value}°, 90°<br><br>` +
                    `2. 應用垂直線和相鄰補角原理：<br>` +
                    `   - 第一組相鄰角：${lines.angles[0].value}° + ${lines.angles[1].value}° + x = 180°<br>` +
                    `   - 其中一條線與垂直線相交<br><br>` +
                    `3. 求解：<br>` +
                    `   x = 180° - (${lines.angles[0].value}° + ${lines.angles[1].value}°)<br>` +
                    `   x = 180° - ${lines.angles[0].value + lines.angles[1].value}°<br>` +
                    `   x = ${lines.angles[3].value}°`;
                break;
        }
        
        return steps;
    }
} 