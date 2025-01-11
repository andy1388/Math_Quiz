export type GeneratorClass = new (difficulty: number) => QuestionGenerator;
export type GeneratorMap = { [key: string]: GeneratorClass };

export interface IGeneratorOutput {
    content: string;       // 题目内容
    correctAnswer: string; // 正确答案
    options: string[];     // 所有选项（包括正确答案）
    correctIndex: number;  // 正确答案在选项中的索引
    explanation: string;   // 解题步骤说明
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected topic: string;
    
    static readonly MAX_DIFFICULTY: number = 5;  // 默认最大难度

    constructor(difficulty: number, topic: string) {
        this.difficulty = difficulty;
        this.topic = topic;
    }

    static getMaxDifficulty(): number {
        return this.MAX_DIFFICULTY;
    }

    // 子类必须实现的生成题目方法
    abstract generate(): IGeneratorOutput;

    // 通用的辅助方法
    protected shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 生成随机整数
    protected getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 生成随机选择
    protected getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
} 