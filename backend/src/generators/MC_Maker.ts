import { IGeneratorOutput } from './QuestionGenerator';

export interface IQuestion {
    content: string;
    options: string[];
    correctIndex: number;
    correctAnswer: string;
    explanation: string;
}

export class MC_Maker {
    static createQuestion(output: IGeneratorOutput, difficulty: number): IQuestion {
        // 選項已經包含在 output.options 中，不需要重新組合
        // 正確答案的索引已經在 output.correctIndex 中

        // 隨機打亂選項順序
        const shuffledOptions = this.shuffleArray([...output.options]);
        
        // 找出正確答案在打亂後的新位置
        const newCorrectIndex = shuffledOptions.indexOf(output.correctAnswer);

        return {
            content: output.content,
            options: shuffledOptions,
            correctIndex: newCorrectIndex,
            correctAnswer: output.correctAnswer,
            explanation: output.explanation
        };
    }

    private static shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
} 