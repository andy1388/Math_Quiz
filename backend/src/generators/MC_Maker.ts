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
        if (!output.wrongAnswers) {
            throw new Error('Generator output missing wrongAnswers array');
        }

        // 合并正确答案和错误答案
        const allOptions = [output.correctAnswer, ...output.wrongAnswers];
        
        // 随机打乱所有选项
        const shuffledOptions = this.shuffleArray(allOptions);
        
        // 找出正确答案在打乱后的新位置
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
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 