import * as path from 'path';

export type GeneratorClass = new (difficulty: number) => QuestionGenerator;
export type GeneratorMap = { [key: string]: GeneratorClass };

export interface IGeneratorOutput {
    content: string;
    correctAnswer: string;
    wrongAnswers: string[];
    explanation: string;

    hasImage?: boolean;
    imageUrl?: string;
    
    type?: 'text' | 'image' | 'mixed';
    metadata?: {
        topic?: string;
        subtopic?: string;
        skills?: string[];
        prerequisites?: string[];
    };
    
    displayOptions?: {
        latex?: boolean;
        graph?: boolean;
        table?: boolean;
    };
}

export abstract class QuestionGenerator {
    protected difficulty: number;
    protected generatorId: string;
    protected maxDifficulty: number;

    constructor(difficulty: number, generatorId: string) {
        this.difficulty = difficulty;
        this.generatorId = generatorId;
        this.maxDifficulty = this.readMaxDifficultyFromDesc();
    }

    private readMaxDifficultyFromDesc(): number {
        try {
            const descPath = path.join(__dirname, 'F2', 'F2_L2_Identities', 'F2L2.5_Cross_Method', `${this.generatorId}.desc.txt`);
            
            console.log('Reading desc file from:', descPath);
            const descContent = require('fs').readFileSync(descPath, 'utf8');
            
            const levelMatch = descContent.match(/Level number[：:]\s*(\d+)/);
            const maxDifficulty = levelMatch ? parseInt(levelMatch[1]) : 5;
            
            console.log('Found max difficulty:', maxDifficulty);
            return maxDifficulty;
        } catch (error) {
            console.error('Error reading max difficulty:', error);
            return 5;
        }
    }

    abstract generate(): IGeneratorOutput;

    protected getGeneratorOutput(output: Partial<IGeneratorOutput>): IGeneratorOutput {
        const result = {
            ...output,
            maxDifficulty: this.maxDifficulty,
            currentDifficulty: this.difficulty
        } as IGeneratorOutput;
        
        console.log('Generator output:', result);
        return result;
    }
} 