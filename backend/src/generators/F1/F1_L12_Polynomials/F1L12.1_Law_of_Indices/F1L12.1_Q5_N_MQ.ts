import { QuestionGenerator, IGeneratorOutput } from '@/generators/QuestionGenerator';
import { LaTeX } from '@/utils/mathUtils';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
}

export default class F1L12_1_Generator_Q5_N_MQ extends QuestionGenerator {
    protected readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    protected readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 簡單：兩步運算，單一變量
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三步運算，單一變量
                terms = this.generateLevel2();
                break;
            case 3: // 較難：兩步運算，雙變量
                terms = this.generateLevel3();
                break;
            case 4: // 進階：三步運算，雙變量
                terms = this.generateLevel4();
                break;
            case 5: // 挑戰：多步運算，多變量和係數
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, this.difficulty);
        
        return this.getGeneratorOutput({
            content: question,
            correctAnswer: answer,
            wrongAnswers: wrongAnswers,
            explanation: steps,
            type: 'text',
            displayOptions: {
                latex: true
            }
        });
    }

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 計算結果
        const result: Term = {
            coefficient: terms.reduce((acc, term) => acc * term.coefficient, 1),
            variables: new Map()
        };

        // 計算每個變量的最終指數
        const allVars = new Set<string>();
        terms.forEach(term => term.variables.forEach((_, v) => allVars.add(v)));

        allVars.forEach(variable => {
            const finalExp = terms.reduce((acc, term) => 
                acc + (term.variables.get(variable) || 0), 0);
            if (finalExp !== 0) {
                result.variables.set(variable, finalExp);
            }
        });

        // 格式化題目
        const questionParts = terms.map(term => {
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            const varPart = sortedVars.map(([variable, exp]) => {
                return exp === 1 ? variable : `${variable}^{${exp}}`;
            }).join('');

            return term.coefficient === 1 ? varPart : `${term.coefficient}${varPart}`;
        });

        // 格式化答案
        const sortedResultVars = Array.from(result.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b));
        
        const varPart = sortedResultVars.map(([variable, exp]) => {
            return exp === 1 ? variable : `${variable}^{${exp}}`;
        }).join('');

        const answer = result.coefficient === 1 ? varPart : `${result.coefficient}${varPart}`;

        // 生成解題步驟
        const steps = `1. 係數相乘：<br>` +
            `\\[${terms.map(t => t.coefficient).join(' \\times ')} = ${result.coefficient}\\]<br>` +
            `2. 同類項指數相加：<br>` +
            `${Array.from(allVars).sort().map(v => {
                const exps = terms.map(t => t.variables.get(v) || 0);
                return `\\[${v}: ${exps.join(' + ')} = ${result.variables.get(v) || 0}\\]`;
            }).join('<br>')}<br>` +
            `3. 最終答案：\\[${answer}\\]`;

        // 將題目轉換為 LaTeX 格式
        const question = `\\[${questionParts.join(' \\times ')}\\]`;

        return [question, answer, steps];
    }

    protected generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp3 = Math.floor(Math.random() * 3) + 2; // 2-4

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) },
            { coefficient: 1, variables: new Map([[variable, exp3]]) }
        ];
    }

    protected generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp4 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) },
            { coefficient: 1, variables: new Map([[variable, exp3]]) },
            { coefficient: 1, variables: new Map([[variable, exp4]]) }
        ];
    }

    protected generateLevel3(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        
        const exp1_1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp1_2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2_1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp2_2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp3_1 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp3_2 = Math.floor(Math.random() * 3) + 2; // 2-4

        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp1_1],
                    [var2, exp1_2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp2_1],
                    [var2, exp2_2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp3_1],
                    [var2, exp3_2]
                ]) 
            }
        ];
    }

    protected generateLevel4(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;

        const exp1_1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp1_2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2_1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2_2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3_1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3_2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp4_1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp4_2 = Math.floor(Math.random() * 4) + 2; // 2-5

        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp1_1],
                    [var2, exp1_2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp2_1],
                    [var2, exp2_2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp3_1],
                    [var2, exp3_2]
                ]) 
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, exp4_1],
                    [var2, exp4_2]
                ]) 
            }
        ];
    }

    protected generateLevel5(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        const [var1, var2, var3] = vars;
        
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];

        return [
            {
                coefficient: coef1,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 4) + 2],
                    [var2, Math.floor(Math.random() * 4) + 2],
                    [var3, Math.floor(Math.random() * 4) + 2]
                ])
            },
            {
                coefficient: coef2,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 4) + 2],
                    [var2, Math.floor(Math.random() * 4) + 2],
                    [var3, Math.floor(Math.random() * 4) + 2]
                ])
            },
            {
                coefficient: coef3,
                variables: new Map([
                    [var1, Math.floor(Math.random() * 4) + 2],
                    [var2, Math.floor(Math.random() * 4) + 2],
                    [var3, Math.floor(Math.random() * 4) + 2]
                ])
            }
        ];
    }

    protected generateWrongAnswers(correctAnswer: string, difficulty: number): string[] {
        const wrongAnswers = new Set<string>();
        
        // 解析正確答案中的所有變量和指數
        const varExps = new Map<string, number>();
        const varRegex = /([a-z])(?:\^{(\d+)})?/g;
        let match;
        
        // 提取係數
        const coeffMatch = correctAnswer.match(/^(\d+)?/);
        const coefficient = coeffMatch && coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
        
        // 提取所有變量和指數
        while ((match = varRegex.exec(correctAnswer)) !== null) {
            const [, variable, expStr] = match;
            const exp = expStr ? parseInt(expStr) : 1;
            varExps.set(variable, exp);
        }

        // 生成錯誤答案的策略
        const strategies = [
            // 所有指數加1
            () => {
                const newVars = new Map(varExps);
                newVars.forEach((exp, v) => newVars.set(v, exp + 1));
                return this.formatTerm(coefficient, newVars);
            },
            // 係數變為2倍
            () => this.formatTerm(2 * coefficient, varExps),
            // 係數變為3倍
            () => this.formatTerm(3 * coefficient, varExps),
            // 交換變量的指數（如果有多個變量）
            () => {
                if (varExps.size >= 2) {
                    const vars = Array.from(varExps.entries());
                    const newVars = new Map(varExps);
                    const [exp1, exp2] = [vars[0][1], vars[1][1]];
                    newVars.set(vars[0][0], exp2);
                    newVars.set(vars[1][0], exp1);
                    return this.formatTerm(coefficient, newVars);
                }
                return null;
            }
        ];

        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrong = strategy();
            if (wrong && wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
                wrongAnswers.add(wrong);
            }
        }

        return Array.from(wrongAnswers);
    }

    private formatTerm(coefficient: number, variables: Map<string, number>): string {
        if (variables.size === 0) return coefficient.toString();
        
        const sortedVars = Array.from(variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : `${variable}^{${exp}}`;
            })
            .join('');
        
        return coefficient === 1 ? sortedVars : `${coefficient}${sortedVars}`;
    }

    protected shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
} 