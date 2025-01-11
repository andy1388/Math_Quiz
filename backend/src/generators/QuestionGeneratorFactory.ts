import { QuestionGenerator, GeneratorClass } from './QuestionGenerator';
import F1L12_1_Generator_Q1_F_MQ from './F1/F1_L12_Polynomials/F1L12.1_Law_of_Indices/F1L12.1_Generator_Q1_F_MQ';

export class QuestionGeneratorFactory {
    private static generators: Map<string, GeneratorClass> = new Map([
        ['F1L12.1_Generator_Q1_F_MQ', F1L12_1_Generator_Q1_F_MQ]
    ]);

    static createGenerator(generatorId: string, difficulty: number): QuestionGenerator | null {
        const GeneratorClass = this.generators.get(generatorId);
        if (!GeneratorClass) {
            return null;
        }
        return new GeneratorClass(difficulty);
    }

    static registerGenerator(id: string, generatorClass: GeneratorClass) {
        this.generators.set(id, generatorClass);
    }
} 