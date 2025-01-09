export interface IQuestion {
    id: string;
    type: string;
    difficulty: number;
    content: string;
    options?: string[];
    answer: string;
    explanation: string;
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected chapter: string;

    constructor(difficulty: number = 1, chapter: string) {
        this.difficulty = Math.min(Math.max(difficulty, 1), 5);
        this.chapter = chapter;
    }

    abstract generate(): IQuestion;
    
    protected generateId(): string {
        return `${this.chapter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
} 