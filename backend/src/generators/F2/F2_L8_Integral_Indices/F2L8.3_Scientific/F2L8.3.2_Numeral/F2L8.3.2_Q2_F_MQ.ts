import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

type Difficulty = 1 | 2 | 3 | 4;

export default class F2L8_3_2_Q2_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q2_F_MQ');
    }

    private generateBinaryNumber(difficulty: Difficulty): string {
        let result = "1"; // 確保開頭是1
        let length: number;
        
        switch(difficulty) {
            case 1: // 3-4位
                length = getRandomInt(2, 3); // 已經有1個1了，所以只需要再生成2-3位
                break;
            case 2: // 5-6位
                length = getRandomInt(4, 5);
                break;
            case 3: // 7-8位
                length = getRandomInt(6, 7);
                break;
            case 4: // 3-4位整數部分 + 小數點 + 2-3位小數部分
                const intLength = getRandomInt(2, 3);
                const decLength = getRandomInt(2, 3);
                
                // 生成整數部分
                for (let i = 0; i < intLength; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                result += ".";
                
                // 生成小數部分
                for (let i = 0; i < decLength; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                return result;
        }
        
        // 確保至少有一個0
        let hasZero = false;
        for (let i = 0; i < length; i++) {
            const bit = Math.random() < 0.5 ? "0" : "1";
            if (bit === "0") hasZero = true;
            result += bit;
        }
        
        // 如果沒有0，強制將最後一位改為0
        if (!hasZero) {
            result = result.slice(0, -1) + "0";
        }
        
        return result;
    }

    private binaryToPowerNotation(binary: string): string {
        const parts = binary.split(".");
        const intPart = parts[0];
        const decPart = parts[1] || "";
        
        let terms: string[] = [];
        
        // 處理整數部分
        for (let i = 0; i < intPart.length; i++) {
            if (intPart[i] === "1") {
                const power = intPart.length - 1 - i;
                terms.push(`2${power === 0 ? "⁰" : "^" + power}`);
            }
        }
        
        // 處理小數部分
        for (let i = 0; i < decPart.length; i++) {
            if (decPart[i] === "1") {
                const power = -(i + 1);
                terms.push(`2⁻${Math.abs(power)}`);
            }
        }
        
        return terms.join(" + ");
    }

    private generateWrongAnswer(binary: string, correctAnswer: string): string {
        const errorTypes = [
            // 使用4作為底數
            () => {
                const terms = correctAnswer.split(" + ");
                return terms.map(term => {
                    if (term.includes("⁻")) {
                        return term; // 保持小數部分不變
                    } else {
                        return term.replace(/^2/, "4");
                    }
                }).join(" + ");
            },
            // 所有指數+1
            () => {
                const terms = correctAnswer.split(" + ");
                return terms.map(term => {
                    if (term.includes("⁻")) {
                        const power = parseInt(term.slice(2)) - 1;
                        return `2⁻${power}`;
                    } else {
                        const power = parseInt(term.slice(2)) + 1;
                        return `2${power === 0 ? "⁰" : "^" + power}`;
                    }
                }).join(" + ");
            },
            // 遺漏最高位
            () => {
                const terms = correctAnswer.split(" + ");
                return terms.slice(1).join(" + ");
            }
        ];

        // 如果是小數，添加特殊的錯誤類型
        if (binary.includes(".")) {
            errorTypes.push(
                // 將負指數當作正指數
                () => correctAnswer.replace(/⁻/g, ""),
                // 完全忽略小數部分
                () => {
                    const terms = correctAnswer.split(" + ");
                    return terms.filter(term => !term.includes("⁻")).join(" + ");
                }
            );
        }

        return errorTypes[getRandomInt(0, errorTypes.length - 1)]();
    }

    private generateExplanation(binary: string, answer: string): string {
        const steps: string[] = [];
        
        steps.push(
            '1. 找出二進制數中的1的位置',
            `\\[${binary}_2\\]`,
            '2. 計算每個1的位值',
            `\\[${answer}\\]`,
            '3. 確認答案'
        );

        return steps.join('\n');
    }

    generate(): IGeneratorOutput {
        const difficulty = this.difficulty as Difficulty;
        const binary = this.generateBinaryNumber(difficulty);
        const correctAnswer = this.binaryToPowerNotation(binary);
        
        // 生成3個錯誤答案
        const wrongAnswers = new Set<string>();
        while (wrongAnswers.size < 3) {
            wrongAnswers.add(this.generateWrongAnswer(binary, correctAnswer));
        }
        
        return {
            content: `將${binary}_2轉換為2的冪次表示式：`,
            correctAnswer,
            wrongAnswers: Array.from(wrongAnswers),
            explanation: this.generateExplanation(binary, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 