export interface IGeneratorOutput {
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    explanation: string;
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected chapter: string;

    constructor(difficulty: number = 1, chapter: string) {
        this.difficulty = Math.min(Math.max(difficulty, 1), 5);
        this.chapter = chapter;
    }

    abstract generate(): IGeneratorOutput;
} 