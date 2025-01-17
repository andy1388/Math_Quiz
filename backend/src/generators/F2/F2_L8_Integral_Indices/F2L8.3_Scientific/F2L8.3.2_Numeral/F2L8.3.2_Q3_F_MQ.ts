import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { getRandomInt } from '@/utils/mathUtils';

type Difficulty = 1 | 2 | 3 | 4;

export default class F2L8_3_2_Q3_F_MQ extends QuestionGenerator {
    constructor(difficulty: number) {
        super(difficulty, 'F2L8.3.2_Q3_F_MQ');
    }

    private generateBinaryNumber(difficulty: Difficulty): string {
        let result = "1"; // 確保開頭是1
        
        switch(difficulty) {
            case 1: // 3-4位
                const length1 = getRandomInt(2, 3);
                for (let i = 0; i < length1; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 2: // 5-6位
                const length2 = getRandomInt(4, 5);
                for (let i = 0; i < length2; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 3: // 7-8位
                const length3 = getRandomInt(6, 7);
                for (let i = 0; i < length3; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                break;
            case 4: // 小數
                // 整數部分（3-4位）
                const intLength = getRandomInt(2, 3);
                for (let i = 1; i < intLength; i++) {
                    result += Math.random() < 0.5 ? "0" : "1";
                }
                result += ".";
                
                // 小數部分（1-2位）
                const decLength = getRandomInt(1, 2);
                let hasOne = false;
                for (let i = 0; i < decLength; i++) {
                    const bit = Math.random() < 0.5 ? "0" : "1";
                    if (bit === "1") hasOne = true;
                    result += bit;
                }
                // 確保小數部分至少有一個1
                if (!hasOne && decLength > 0) {
                    const pos = getRandomInt(0, decLength - 1);
                    result = result.slice(0, result.indexOf(".") + 1 + pos) + "1" + 
                            result.slice(result.indexOf(".") + 1 + pos + 1);
                }
                return result;
        }
        
        // 確保至少有一個0（對於非小數情況）
        if (!result.includes("0")) {
            const pos = getRandomInt(1, result.length - 1);
            result = result.slice(0, pos) + "0" + result.slice(pos + 1);
        }
        
        return result;
    }

    private binaryToDecimal(binary: string): number {
        const parts = binary.split(".");
        const intPart = parts[0];
        const decPart = parts[1] || "";
        
        let result = 0;
        
        // 處理整數部分
        for (let i = 0; i < intPart.length; i++) {
            if (intPart[i] === "1") {
                result += Math.pow(2, intPart.length - 1 - i);
            }
        }
        
        // 處理小數部分
        for (let i = 0; i < decPart.length; i++) {
            if (decPart[i] === "1") {
                result += Math.pow(2, -(i + 1));
            }
        }
        
        return Number(result.toFixed(3)); // 保留3位小數
    }

    private generateWrongAnswer(binary: string, correctAnswer: number): number {
        const errorTypes = [
            // 1. 位值計算錯誤
            () => {
                const parts = binary.split(".");
                const intPart = parts[0];
                let result = 0;
                for (let i = 0; i < intPart.length; i++) {
                    if (intPart[i] === "1") {
                        // 隨機將某個2的冪次加1或減1
                        result += Math.pow(2, intPart.length - 1 - i) + (Math.random() < 0.5 ? 1 : -1);
                    }
                }
                return Math.abs(Math.round(result));
            },
            
            // 2. 遺漏某位
            () => {
                const parts = binary.split(".");
                const intPart = parts[0];
                let result = 0;
                const skipPos = getRandomInt(0, intPart.length - 1);
                for (let i = 0; i < intPart.length; i++) {
                    if (i !== skipPos && intPart[i] === "1") {
                        result += Math.pow(2, intPart.length - 1 - i);
                    }
                }
                return Math.abs(Math.round(result));
            },
            
            // 3. 直接把二進制當作十進制
            () => {
                return parseInt(binary.replace(".", ""), 10);
            },
            
            // 4. 小數相關錯誤（難度4）
            () => {
                if (!binary.includes(".")) return correctAnswer;
                const parts = binary.split(".");
                const intPart = parts[0];
                const decPart = parts[1];
                let result = 0;
                
                // 以下是幾種常見的小數錯誤類型
                const decimalErrors = [
                    // 完全忽略小數部分
                    () => this.binaryToDecimal(intPart),
                    
                    // 將小數部分當作整數處理
                    () => {
                        const intValue = this.binaryToDecimal(intPart);
                        const decValue = this.binaryToDecimal(decPart);
                        return intValue + decValue / Math.pow(10, decPart.length);
                    },
                    
                    // 將負指數當作正指數
                    () => {
                        let result = this.binaryToDecimal(intPart);
                        for (let i = 0; i < decPart.length; i++) {
                            if (decPart[i] === "1") {
                                result += Math.pow(2, i + 1);  // 使用正指數而不是負指數
                            }
                        }
                        return result;
                    }
                ];
                
                const errorChoice = getRandomInt(0, decimalErrors.length - 1);
                return decimalErrors[errorChoice]();
            }
        ];

        const errorIndex = getRandomInt(0, errorTypes.length - 1);
        let wrongAnswer = errorTypes[errorIndex]();
        
        // 確保錯誤答案不等於正確答案且為合理值
        if (wrongAnswer === correctAnswer || 
            !isFinite(wrongAnswer) || 
            isNaN(wrongAnswer) ||
            Math.abs(wrongAnswer) > 1000) {  // 添加合理值的範圍檢查
            wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1);
        }
        
        // 對於小數，保留3位小數
        return binary.includes(".") ? 
            Number(wrongAnswer.toFixed(3)) : 
            Math.round(wrongAnswer);
    }

    private generateExplanation(binary: string, answer: number): string {
        const parts = binary.split(".");
        const intPart = parts[0];
        const decPart = parts[1] || "";
        
        let steps: string[] = ['計算步驟：'];
        
        // 整數部分的計算
        let intTerms: string[] = [];
        let intSum = 0;
        for (let i = 0; i < intPart.length; i++) {
            if (intPart[i] === "1") {
                const power = intPart.length - 1 - i;
                const value = Math.pow(2, power);
                intSum += value;
                intTerms.push(`2^{${power}} = ${value}`);
            }
        }
        
        if (intTerms.length > 0) {
            steps.push(`整數部分：${intTerms.join(" + ")} = ${intSum}`);
        }
        
        // 小數部分的計算
        if (decPart) {
            let decTerms: string[] = [];
            let decSum = 0;
            for (let i = 0; i < decPart.length; i++) {
                if (decPart[i] === "1") {
                    const power = -(i + 1);
                    const value = Math.pow(2, power);
                    decSum += value;
                    decTerms.push(`2^{${power}} = ${value}`);
                }
            }
            if (decTerms.length > 0) {
                steps.push(`小數部分：${decTerms.join(" + ")} = ${decSum.toFixed(3)}`);
                steps.push(`總和：${intSum} + ${decSum.toFixed(3)} = ${answer}`);
            }
        }
        
        if (!decPart) {
            steps.push(`最終結果：${answer}`);
        }
        
        return steps.join('\n');
    }

    generate(): IGeneratorOutput {
        const difficulty = this.difficulty as Difficulty;
        const binary = this.generateBinaryNumber(difficulty);
        const correctAnswer = this.binaryToDecimal(binary);
        
        // 生成3個錯誤答案
        const wrongAnswers = new Set<number>();
        while (wrongAnswers.size < 3) {
            wrongAnswers.add(this.generateWrongAnswer(binary, correctAnswer));
        }
        
        return {
            content: `將${binary}₂轉換為十進制數：`,
            correctAnswer: correctAnswer.toString(),
            wrongAnswers: Array.from(wrongAnswers).map(x => x.toString()),
            explanation: this.generateExplanation(binary, correctAnswer),
            type: 'text',
            displayOptions: {
                latex: true
            }
        };
    }
} 