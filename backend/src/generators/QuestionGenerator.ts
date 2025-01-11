export type GeneratorClass = new (difficulty: number) => QuestionGenerator;
export type GeneratorMap = { [key: string]: GeneratorClass };

export interface IGeneratorOutput {
    content: string;
    correctAnswer: string;
    wrongAnswers: string[];
    explanation: string;
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected generatorId: string;

    constructor(difficulty: number, generatorId: string) {
        this.difficulty = difficulty;
        this.generatorId = generatorId;
    }

    abstract generate(): IGeneratorOutput;
} 