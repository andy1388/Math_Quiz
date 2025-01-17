import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

interface BinaryConversionQuestion {
    binary: string;
    decimal: number;
    powerForm: string;
}

export default class F2L8_3_2_Q2_F_MQ extends QuestionGenerator {
    protected difficulty: number;
    private question!: BinaryConversionQuestion;

    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q2_F_MQ');
        this.difficulty = difficulty;
    }

    private generateBinaryNumber(minLength: number, maxLength: number, minDecimal: number, maxDecimal: number): string {
        let binary: string;
        let decimal: number;
        
        do {
            // 随机决定长度
            const length = getRandomInt(minLength, maxLength);
            
            // 生成二进制数（确保以1开头）
            binary = '1';
            let hasZero = false;
            
            // 生成剩余的位
            for (let i = 1; i < length; i++) {
                const bit = Math.random() < 0.5 ? '0' : '1';
                if (bit === '0') hasZero = true;
                binary += bit;
            }
            
            // 如果没有0，强制添加一个0
            if (!hasZero && binary.length > 1) {
                const pos = getRandomInt(1, binary.length - 1);
                binary = binary.substring(0, pos) + '0' + binary.substring(pos + 1);
            }
            
            // 计算十进制值
            decimal = parseInt(binary, 2);
            
        } while (decimal < minDecimal || decimal > maxDecimal);
        
        return binary;
    }

    private generateQuestion(): BinaryConversionQuestion {
        try {
            let binary: string;
            
            switch (this.difficulty) {
                case 1:
                    binary = this.generateBinaryNumber(3, 4, 4, 15);
                    break;
                case 2:
                    binary = this.generateBinaryNumber(5, 6, 16, 63);
                    break;
                case 3:
                    binary = this.generateBinaryNumber(7, 8, 64, 255);
                    break;
                default:
                    throw new Error(`Invalid difficulty: ${this.difficulty}`);
            }
            
            const decimal = parseInt(binary, 2);
            
            // 生成幂次形式的答案
            const powerTerms = binary.split('')
                .reverse()
                .map((bit, index) => ({ bit, index }))
                .filter(({ bit }) => bit === '1')
                .map(({ index }) => `2^${index}`)
                .reverse()
                .join(' + ');

            return {
                binary,
                decimal,
                powerForm: powerTerms
            };
        } catch (error) {
            console.error('Error in generateQuestion:', error);
            return {
                binary: '1011',
                decimal: 11,
                powerForm: '2^3 + 2^1 + 2^0'
            };
        }
    }

    private generateWrongAnswers(correctDecimal: number, binary: string): string[] {
        try {
            const wrongAnswers = new Set<string>();
            
            // 1. 位值错误：某个2的幂次计算错误
            const binaryDigits = binary.split('').reverse();
            let modifiedSum = 0;
            for (let i = 0; i < binaryDigits.length; i++) {
                if (binaryDigits[i] === '1') {
                    // 故意使用错误的幂次
                    modifiedSum += Math.pow(2, i + (Math.random() < 0.5 ? 1 : -1));
                }
            }
            if (modifiedSum > 0 && modifiedSum !== correctDecimal) {
                wrongAnswers.add(modifiedSum.toString());
            }

            // 2. 常见错误：直接把二进制当作十进制
            const binaryAsDecimal = parseInt(binary);
            if (binaryAsDecimal !== correctDecimal) {
                wrongAnswers.add(binaryAsDecimal.toString());
            }

            // 3. 运算错误：遗漏或多算某个位值
            const powerValues = binary.split('').reverse().map((bit, index) => 
                bit === '1' ? Math.pow(2, index) : 0
            ).filter(v => v > 0);

            // 遗漏一个位值
            if (powerValues.length > 1) {
                const sum = powerValues.reduce((a, b) => a + b, 0);
                const omitOne = powerValues[getRandomInt(0, powerValues.length - 1)];
                const omitSum = sum - omitOne;
                if (omitSum !== correctDecimal) {
                    wrongAnswers.add(omitSum.toString());
                }
            }

            // 如果还需要更多错误答案
            while (wrongAnswers.size < 3) {
                // 生成接近的数字
                const offset = getRandomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
                const newWrong = correctDecimal + offset;
                if (newWrong > 0 && newWrong !== correctDecimal) {
                    wrongAnswers.add(newWrong.toString());
                }
            }

            return Array.from(wrongAnswers).slice(0, 3);
        } catch (error) {
            console.error('Error in generateWrongAnswers:', error);
            return [
                (correctDecimal + 1).toString(),
                (correctDecimal + 2).toString(),
                (correctDecimal + 3).toString()
            ];
        }
    }

    private generateExplanation(question: BinaryConversionQuestion): string {
        try {
            const steps: string[] = [];
            const binaryDigits = question.binary.split('').reverse();
            
            steps.push(
                '1. 將二進制數的每個位置轉換為2的冪次',
                `\\[${question.binary}_2 = ${question.powerForm}\\]`,
                '2. 計算結果',
                `\\[${question.powerForm} = ${question.decimal}_{10}\\]`
            );

            return steps.join('\n');
        } catch (error) {
            console.error('Error in generateExplanation:', error);
            return '解释生成错误';
        }
    }

    generate(): IGeneratorOutput {
        try {
            this.question = this.generateQuestion();
            
            const content = `Convert the following binary number to decimal:\n\\[${this.question.binary}_2\\]`;

            const wrongAnswers = this.generateWrongAnswers(
                this.question.decimal,
                this.question.binary
            );

            return {
                content,
                correctAnswer: this.question.powerForm,
                wrongAnswers: wrongAnswers.map(w => {
                    // 为错误答案也生成幂次形式
                    const num = parseInt(w);
                    if (isNaN(num)) return w;
                    
                    // 找出2的幂次
                    const powers: number[] = [];
                    let temp = num;
                    let power = 0;
                    while (temp > 0) {
                        if (temp % 2 === 1) {
                            powers.push(power);
                        }
                        temp = Math.floor(temp / 2);
                        power++;
                    }
                    return powers.map(p => `2^${p}`).reverse().join(' + ');
                }),
                explanation: this.generateExplanation(this.question),
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        } catch (error) {
            console.error('Error in generate:', error);
            return {
                content: 'Convert the following binary number to decimal:\n\\[1011_2\\]',
                correctAnswer: '2^3 + 2^1 + 2^0',
                wrongAnswers: ['2^3 + 2^2', '2^3 + 2^2 + 2^0', '2^2 + 2^1 + 2^0'],
                explanation: '错误生成题目',
                type: 'text',
                displayOptions: {
                    latex: true
                }
            };
        }
    }
} 