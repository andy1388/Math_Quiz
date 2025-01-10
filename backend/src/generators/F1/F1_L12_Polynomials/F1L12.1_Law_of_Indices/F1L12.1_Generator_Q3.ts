import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
}

export class F1L12_1_Generator_Q3 extends QuestionGenerator {
    private readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    private readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        
        switch (this.difficulty) {
            case 1: // 簡單：單一變量的簡單除法
                terms = this.generateLevel1();
                break;
            case 2: // 中等：單一變量的較大指數除法
                terms = this.generateLevel2();
                break;
            case 3: // 較難：雙變量的簡單除法
                terms = this.generateLevel3();
                break;
            case 4: // 進階：包含係數的雙變量除法
                terms = this.generateLevel4();
                break;
            case 5: // 挑戰：多項式除法
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, this.difficulty);
        
        return {
            content: question,
            correctAnswer: answer,
            options: [answer, ...wrongAnswers],
            correctIndex: 0,
            explanation: steps
        };
    }

    private generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp2 = Math.floor(Math.random() * 3) + 2; // 2-4
        const exp1 = exp2 + Math.floor(Math.random() * 3) + 1; // 確保被除數指數大於除數

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp2 = Math.floor(Math.random() * 4) + 3; // 3-6
        const exp1 = exp2 + Math.floor(Math.random() * 3) + 2; // 確保差值至少為2

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }

    private generateLevel3(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        
        // 確保所有指數運算結果為正
        const exp1_1 = Math.floor(Math.random() * 3) + 4; // 4-6
        const exp1_2 = Math.floor(Math.random() * 3) + 4; // 4-6
        const exp2_1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const exp2_2 = Math.floor(Math.random() * 2) + 2; // 2-3

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
            }
        ];
    }

    private generateLevel4(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;

        // 選擇容易整除的係數
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef1 = coef2 * (Math.floor(Math.random() * 3) + 2); // 確保能整除

        // 確保指數差為正
        const exp1_1 = Math.floor(Math.random() * 2) + 4; // 4-5
        const exp1_2 = Math.floor(Math.random() * 2) + 4; // 4-5
        const exp2_1 = Math.floor(Math.random() * 2) + 2; // 2-3
        const exp2_2 = Math.floor(Math.random() * 2) + 2; // 2-3

        return [
            { 
                coefficient: coef1, 
                variables: new Map([
                    [var1, exp1_1],
                    [var2, exp1_2]
                ]) 
            },
            { 
                coefficient: coef2, 
                variables: new Map([
                    [var1, exp2_1],
                    [var2, exp2_2]
                ]) 
            }
        ];
    }

    private generateLevel5(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        
        // 生成三個容易整除的係數
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef1 = coef2 * coef3 * (Math.floor(Math.random() * 2) + 2); // 確保最終結果在1-20範圍內

        // 生成遞減的指數，確保每步都是正數
        const exponents = vars.map(() => ({
            exp1: Math.floor(Math.random() * 3) + 8, // 8-10
            exp2: Math.floor(Math.random() * 2) + 4, // 4-5
            exp3: Math.floor(Math.random() * 2) + 2  // 2-3
        }));

        return [
            {
                coefficient: coef1,
                variables: new Map(
                    vars.map((v, i) => [v, exponents[i].exp1])
                )
            },
            {
                coefficient: coef2,
                variables: new Map(
                    vars.map((v, i) => [v, exponents[i].exp2])
                )
            },
            {
                coefficient: coef3,
                variables: new Map(
                    vars.map((v, i) => [v, exponents[i].exp3])
                )
            }
        ];
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private formatQuestion(terms: Term[]): [string, string, string] {
        // 計算結果
        const result: Term = {
            coefficient: terms.reduce((acc, term, index) => 
                index === 0 ? term.coefficient : acc / term.coefficient, terms[0].coefficient),
            variables: new Map()
        };

        // 計算每個變量的最終指數
        const allVars = new Set<string>();
        terms.forEach(term => term.variables.forEach((_, v) => allVars.add(v)));

        allVars.forEach(variable => {
            let finalExp = 0;
            terms.forEach((term, index) => {
                const exp = term.variables.get(variable) || 0;
                finalExp = index === 0 ? exp : finalExp - exp;
            });
            // 只有當最終指數不為 0 時才加入結果
            if (finalExp !== 0) {
                result.variables.set(variable, finalExp);
            }
        });

        // 格式化題目
        const questionParts = terms.map(term => {
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            const varPart = sortedVars.map(([variable, exp]) => {
                // 當指數為 1 時不顯示指數
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            }).join('');

            // 當係數為 1 時不顯示係數
            return term.coefficient === 1 ? varPart : term.coefficient + varPart;
        });

        // 格式化答案
        const sortedResultVars = Array.from(result.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b));
        
        const varPart = sortedResultVars.map(([variable, exp]) => {
            // 當指數為 1 時不顯示指數
            return exp === 1 ? variable : variable + '^{' + exp + '}';
        }).join('');

        // 當係數為 1 時不顯示係數
        const answer = result.coefficient === 1 ? varPart : result.coefficient + varPart;

        // 生成解題步驟，使用 LaTeX 格式
        const steps = `解題步驟：
1. 係數相除：
   \\(${terms.map(t => t.coefficient).join(' \\div ')} = ${result.coefficient}\\)

2. 同類項指數相減：
${Array.from(allVars).sort().map(v => {
    const exps = terms.map(t => t.variables.get(v) || 0);
    return `   \\(${v}: ${exps.join(' - ')} = ${result.variables.get(v) || 0}\\)`;
}).join('\n')}

3. 最終答案：\\(${answer}\\)`;

        return [questionParts.join(' \\div '), answer, steps];
    }

    private generateWrongAnswers(correctAnswer: string, difficulty: number): string[] {
        const wrongAnswers = new Set<string>();
        
        // 解析正確答案，處理單一變量無指數的情況
        const match = correctAnswer.match(/^(\d*)([a-z])(?:\^{(\d+)})?$/);
        if (!match) {
            // 如果無法解析，生成一些基本的錯誤答案
            return [
                correctAnswer + '^2',
                '2' + correctAnswer,
                correctAnswer + '^3'
            ];
        }
        
        const [, coeffStr, variable, expStr] = match;
        const coef = coeffStr ? parseInt(coeffStr) : 1;
        const exp = expStr ? parseInt(expStr) : 1;
        
        // 生成錯誤答案的策略
        const strategies = [
            // 指數加1
            () => this.formatTerm(coef, new Map([[variable, exp + 1]])),
            // 指數減1（如果可能）
            () => exp > 1 ? this.formatTerm(coef, new Map([[variable, exp - 1]])) : variable + '^2',
            // 係數變為2
            () => this.formatTerm(2, new Map([[variable, exp]])),
            // 係數變為3
            () => this.formatTerm(3, new Map([[variable, exp]]))
        ];

        // 生成三個不同的錯誤答案
        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrong = strategy();
            if (wrong !== correctAnswer && !wrongAnswers.has(wrong)) {
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
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            })
            .join('');
        
        return coefficient === 1 ? sortedVars : coefficient + sortedVars;
    }
} 