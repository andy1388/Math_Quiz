import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Factor {
    p: number;  // 第一个因式的常数项
    q: number;  // 第二个因式的常数项
}

export default class F2L2_5_Generator_Q1_F_MQ extends QuestionGenerator {
    constructor(difficulty: number = 1) {
        super(difficulty, 'F2L2.5');
    }

    generate(): IGeneratorOutput {
        // 根据难度生成系数
        const [b, c] = this.generateCoefficients();
        
        // 找出因式
        const factors = this.findFactors(b, c);
        
        // 生成题目表达式
        const expression = this.formatExpression(b, c);
        
        // 生成正确答案
        const answer = this.formatAnswer(factors);
        
        // 生成错误选项
        const wrongAnswers = this.generateWrongAnswers(factors, b, c);
        
        // 随机打乱选项并记录正确答案的位置
        const options = [answer, ...wrongAnswers];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(answer);

        // 生成解题步骤
        const steps = this.generateSteps(b, c, factors);

        return {
            content: expression,
            correctAnswer: answer,
            options: shuffledOptions,
            correctIndex: correctIndex,
            explanation: steps
        };
    }

    private generateCoefficients(): [number, number] {
        let b: number, c: number;
        
        switch (this.difficulty) {
            case 1: // 简单：正系数
                b = Math.floor(Math.random() * 8) + 3;  // 3 到 10
                c = Math.floor(Math.random() * 8) + 2;  // 2 到 9
                break;
            case 2: // 中等：有负系数
                b = -(Math.floor(Math.random() * 6) + 2);  // -7 到 -2
                c = Math.floor(Math.random() * 6) + 2;     // 2 到 7
                break;
            case 3: // 较难：负常数项
                b = Math.floor(Math.random() * 7) - 3;     // -3 到 3
                c = -(Math.floor(Math.random() * 10) + 3); // -12 到 -3
                break;
            case 4: // 进阶：较大系数
                b = Math.floor(Math.random() * 11) + 8;    // 8 到 18
                c = Math.floor(Math.random() * 16) + 15;   // 15 到 30
                break;
            case 5: // 挑战：需要多次尝试
                b = Math.floor(Math.random() * 15) - 7;    // -7 到 7
                c = Math.floor(Math.random() * 25) - 12;   // -12 到 12
                break;
            default:
                throw new Error(`难度等级 ${this.difficulty} 不可用`);
        }
        
        return [b, c];
    }

    private findFactors(b: number, c: number): Factor {
        // 找出两个数，它们的和为b，积为c
        for (let p = -20; p <= 20; p++) {
            const q = b - p;
            if (p * q === c && p <= q) {  // 确保p <= q
                return { p, q };
            }
        }
        throw new Error(`无法找到合适的因式：b=${b}, c=${c}`);
    }

    private formatExpression(b: number, c: number): string {
        const bTerm = b === 0 ? '' : 
                     b === 1 ? '+ x' :
                     b === -1 ? '- x' :
                     b > 0 ? `+ ${b}x` : `${b}x`;
        const cTerm = c === 0 ? '' :
                     c > 0 ? `+ ${c}` : `${c}`;
        
        return `x^2 ${bTerm} ${cTerm}`;
    }

    private formatAnswer(factors: Factor): string {
        const { p, q } = factors;
        const firstTerm = p === 0 ? 'x' :
                         p > 0 ? `(x + ${p})` : `(x ${p})`;
        const secondTerm = q === 0 ? 'x' :
                          q > 0 ? `(x + ${q})` : `(x ${q})`;
        return `${firstTerm}${secondTerm}`;
    }

    private generateWrongAnswers(factors: Factor, b: number, c: number): string[] {
        const wrongAnswers = new Set<string>();
        const { p, q } = factors;

        // 1. 交换正负号
        wrongAnswers.add(this.formatAnswer({ p: -p, q: -q }));

        // 2. 使用和为b但积不为c的数
        const wrongP = Math.min(p + 1, q - 1);
        const wrongQ = b - wrongP;
        wrongAnswers.add(this.formatAnswer({ p: wrongP, q: wrongQ }));

        // 3. 使用常见错误：把b/2作为系数
        const halfB = Math.floor(b/2);
        wrongAnswers.add(this.formatAnswer({ p: halfB, q: halfB }));

        return Array.from(wrongAnswers);
    }

    private generateSteps(b: number, c: number, factors: Factor): string {
        const { p, q } = factors;
        return `解題步驟：
1. 觀察二次項：x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}
2. 找出兩個數：
   - 它們的和為一次項係數：${p} + ${q} = ${b}
   - 它們的積為常數項：${p} × ${q} = ${c}
3. 因式分解：
   - 第一個因式：(x ${p >= 0 ? '+' : ''}${p})
   - 第二個因式：(x ${q >= 0 ? '+' : ''}${q})
4. 最終答案：(x ${p >= 0 ? '+' : ''}${p})(x ${q >= 0 ? '+' : ''}${q})`;
    }
} 