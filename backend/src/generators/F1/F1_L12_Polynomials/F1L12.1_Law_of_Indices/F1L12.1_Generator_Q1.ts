import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
}

export class F1L12_1_Generator_Q1 extends QuestionGenerator {
    private readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 簡單：兩個單項式相乘
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三個單項式相乘
                terms = this.generateLevel2();
                break;
            case 3: // 較難：包含係數的單項式相乘
                terms = this.generateLevel3();
                break;
            case 4: // 進階：兩個變量的運算
                terms = this.generateLevel4();
                break;
            case 5: // 挑戰：三個變量和係數的運算
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, this.difficulty);
        
        return {
            question: question,
            correctAnswer: answer,
            wrongAnswers: wrongAnswers,
            explanation: steps
        };
    }

    private generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 4) + 1; // 1-4
        const exp2 = Math.floor(Math.random() * 4) + 1; // 1-4

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp1 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp2 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp3 = Math.floor(Math.random() * 5) + 2; // 2-6

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) },
            { coefficient: 1, variables: new Map([[variable, exp3]]) }
        ];
    }

    private generateLevel3(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 5)]; // 使用更多變量
        const coef = Math.floor(Math.random() * 8) + 2; // 2-9
        const exp1 = Math.floor(Math.random() * 5) + 2; // 2-6
        const exp2 = Math.floor(Math.random() * 5) + 2; // 2-6

        return [
            { coefficient: coef, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel4(): Term[] {
        // 隨機選擇兩個不同的變量
        const vars = this.shuffleArray(this.VARIABLES.slice()).slice(0, 2);
        const exp1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp4 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [vars[0], exp1],
                    [vars[1], exp2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [vars[0], exp3],
                    [vars[1], exp4]
                ]) 
            }
        ];
    }

    private generateLevel5(): Term[] {
        // 隨機選擇三個不同的變量
        const vars = this.shuffleArray(this.VARIABLES.slice()).slice(0, 3);
        const coef1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const coef2 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { 
                coefficient: coef1, 
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 3) + 2], // 2-4
                    [vars[1], Math.floor(Math.random() * 3) + 2],
                    [vars[2], Math.floor(Math.random() * 3) + 2]
                ]) 
            },
            { 
                coefficient: coef2, 
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 3) + 2],
                    [vars[1], Math.floor(Math.random() * 3) + 2],
                    [vars[2], Math.floor(Math.random() * 3) + 2]
                ]) 
            }
        ];
    }

    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private generateWrongAnswers(correctAnswer: string, difficulty: number): string[] {
        const wrongAnswers: string[] = [];
        const match = correctAnswer.match(/^(\d*)([a-z])(\d+)$/);
        
        if (!match) {
            console.error('無法解析正確答案:', correctAnswer);
            return ['ERROR', 'ERROR', 'ERROR'];
        }

        const [, coefficient, variable, exponent] = match;
        const coef = coefficient ? parseInt(coefficient) : 1;
        const exp = parseInt(exponent);

        // 生成三個不同的錯誤答案
        const wrongOptions = [
            // 指數相乘而不是相加
            `${variable}${exp + 1}`,
            // 係數相加而不是相乘
            `${coef + 1}${variable}${exp}`,
            // 指數少加了1
            `${variable}${exp - 1}`,
            // 指數多加了1
            `${variable}${exp + 2}`,
            // 係數錯誤
            `2${variable}${exp}`
        ];

        // 隨機選擇三個不同的錯誤答案
        while (wrongAnswers.length < 3 && wrongOptions.length > 0) {
            const index = Math.floor(Math.random() * wrongOptions.length);
            const wrongAnswer = wrongOptions[index];
            if (!wrongAnswers.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                wrongAnswers.push(wrongAnswer);
            }
            wrongOptions.splice(index, 1);
        }

        return wrongAnswers;
    }

    private formatQuestion(terms: Term[]): [string, string, string] {
        // 格式化題目
        const questionParts = terms.map(term => {
            let termStr = '';
            if (term.coefficient !== 1) termStr += term.coefficient;
            term.variables.forEach((exp, variable) => {
                termStr += variable + (exp !== 1 ? exp : '');
            });
            return termStr;
        });

        // 計算答案
        const result: Term = {
            coefficient: terms.reduce((acc, term) => acc * term.coefficient, 1),
            variables: new Map()
        };

        // 合併所有變量的指數
        terms.forEach(term => {
            term.variables.forEach((exp, variable) => {
                result.variables.set(
                    variable,
                    (result.variables.get(variable) || 0) + exp
                );
            });
        });

        // 格式化答案
        let answer = '';
        if (result.coefficient !== 1) answer += result.coefficient;
        
        // 按字母順序排列變量
        const sortedVars = Array.from(result.variables.entries())
            .sort(([a,], [b,]) => a.localeCompare(b));
        
        sortedVars.forEach(([variable, exp]) => {
            answer += variable + (exp !== 1 ? exp : '');
        });

        // 生成解題步驟，更詳細的說明
        const steps = `解題步驟：
1. 係數相乘：${terms.map(t => t.coefficient).join(' × ')} = ${result.coefficient}
2. 同類項指數相加：
${Array.from(result.variables.entries())
    .map(([v, e]) => `   ${v}: ${terms.map(t => t.variables.get(v) || 0).join(' + ')} = ${e}`)
    .join('\n')}
3. 最終答案：${answer}`;

        return [questionParts.join(' × '), answer, steps];
    }
} 