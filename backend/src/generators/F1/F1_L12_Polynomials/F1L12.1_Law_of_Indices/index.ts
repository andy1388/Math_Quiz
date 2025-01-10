import { GeneratorMap } from '../../../QuestionGenerator';
import { F1L12_1_Generator_Q1 } from './F1L12.1_Generator_Q1';
import { F1L12_1_Generator_Q2 } from './F1L12.1_Generator_Q2';
import { F1L12_1_Generator_Q3 } from './F1L12.1_Generator_Q3';
import { F1L12_1_Generator_Q4 } from './F1L12.1_Generator_Q4';

export const generators: GeneratorMap = {
    'F1L12.1_1': F1L12_1_Generator_Q1,
    'F1L12.1_2': F1L12_1_Generator_Q2,
    'F1L12.1_3': F1L12_1_Generator_Q3,
    'F1L12.1_4': F1L12_1_Generator_Q4
}; 