export type GeneratorClass = new (difficulty: number) => QuestionGenerator;
export type GeneratorMap = { [key: string]: GeneratorClass };

export interface IGeneratorOutput {
    content: string;          // 題目內容
    correctAnswer: string;    // 正確答案
    options: string[];        // 選項列表（包括正確答案）
    correctIndex: number;     // 正確答案的索引
    explanation: string;      // 解題步驟
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