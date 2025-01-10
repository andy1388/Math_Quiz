import { IGeneratorOutput } from './QuestionGenerator';

export interface IQuestion {
    id: string;
    type: string;
    difficulty: number;
    content: string;
    options: string[];
    correctIndex: number;
    answer: string;
    explanation: string;
}

export class MC_Maker {
    static createQuestion(output: IGeneratorOutput, difficulty: number): IQuestion {
        // 打亂選項順序
        const options = [...output.wrongAnswers, output.correctAnswer];
        const shuffled = this.shuffleArray(options);
        const correctIndex = shuffled.indexOf(output.correctAnswer);

        return {
            id: this.generateId(),
            type: 'multiple-choice',
            difficulty: difficulty,
            content: output.question,
            options: shuffled,
            correctIndex: correctIndex,
            answer: output.correctAnswer,
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

    private static generateId(): string {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
} 