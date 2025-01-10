import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    hasMissing?: boolean;  // 標記是否包含缺失的指數
    missingVar?: string;   // 記錄哪個變量的指數缺失
}

export class F1L12_1_Generator_Q4 extends QuestionGenerator {
    private readonly VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    private readonly EASY_COEFFICIENTS = [2, 3, 4, 6, 8, 9, 12, 15, 16, 18, 20];
    private missingExponent: number = 0;  // 記錄缺失的指數值

    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L12.1');
    }

    generate(): IGeneratorOutput {
        let terms: Term[] = [];
        let result: Term;
        
        switch (this.difficulty) {
            case 1: // 簡單：單一變量的簡單除法
                [terms, result] = this.generateLevel1();
                break;
            case 2: // 中等：單一變量的較大指數除法
                [terms, result] = this.generateLevel2();
                break;
            case 3: // 較難：雙變量的簡單除法
                [terms, result] = this.generateLevel3();
                break;
            case 4: // 進階：包含係數的雙變量除法
                [terms, result] = this.generateLevel4();
                break;
            case 5: // 挑戰：多項式除法
                [terms, result] = this.generateLevel5();
                break;
            default:
                throw new Error(`難度等級 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms, result);
        const wrongAnswers = this.generateWrongAnswers(this.missingExponent, this.difficulty);
        
        return {
            content: question,
            correctAnswer: answer,
            options: this.shuffleArray([answer, ...wrongAnswers]),
            correctIndex: 0,
            explanation: steps
        };
    }

    private generateLevel1(): [Term[], Term] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        // 先決定結果的指數，確保至少為 1
        const resultExp = Math.floor(Math.random() * 3) + 1; // 1-3
        // 確保第一個指數比結果大至少 1
        const exp1 = resultExp + Math.floor(Math.random() * 3) + 1; // (resultExp + 1) 到 (resultExp + 3)
        
        // 計算缺失的指數：exp1 - resultExp = missingExponent
        this.missingExponent = exp1 - resultExp; // 一定會是正數

        return [
            [
                { coefficient: 1, variables: new Map([[variable, exp1]]) },
                { 
                    coefficient: 1, 
                    variables: new Map([[variable, this.missingExponent]]),
                    hasMissing: true,
                    missingVar: variable
                }
            ],
            { coefficient: 1, variables: new Map([[variable, resultExp]]) }
        ];
    }

    private generateLevel2(): [Term[], Term] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        // 先決定結果的指數，確保至少為 2
        const resultExp = Math.floor(Math.random() * 3) + 2; // 2-4
        // 確保第一個指數比結果大至少 2
        const exp1 = resultExp + Math.floor(Math.random() * 3) + 2; // (resultExp + 2) 到 (resultExp + 4)
        
        // 計算缺失的指數：exp1 - resultExp = missingExponent
        this.missingExponent = exp1 - resultExp; // 一定會是正數

        return [
            [
                { coefficient: 1, variables: new Map([[variable, exp1]]) },
                { 
                    coefficient: 1, 
                    variables: new Map([[variable, this.missingExponent]]),
                    hasMissing: true,
                    missingVar: variable
                }
            ],
            { coefficient: 1, variables: new Map([[variable, resultExp]]) }
        ];
    }

    private generateLevel3(): [Term[], Term] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        
        // 確保所有指數運算結果為正
        const exp1_1 = Math.floor(Math.random() * 3) + 4; // 4-6
        const exp1_2 = Math.floor(Math.random() * 3) + 4; // 4-6
        const exp2_2 = Math.floor(Math.random() * 2) + 2; // 2-3
        const resultExp1 = Math.floor(Math.random() * 3) + 2; // 2-4

        this.missingExponent = exp1_1 - resultExp1; // 計算缺失的指數
        const exp2_1 = this.missingExponent;

        return [
            [
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
                    ]),
                    hasMissing: true,
                    missingVar: var1
                }
            ],
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, resultExp1],
                    [var2, exp1_2 - exp2_2]
                ]) 
            }
        ];
    }

    private generateLevel4(): [Term[], Term] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;

        // 選擇容易整除的係數
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const resultCoef = Math.floor(Math.random() * 3) + 2; // 2-4
        const coef1 = coef2 * resultCoef;

        // 確保指數差為正
        const exp1_1 = Math.floor(Math.random() * 2) + 4; // 4-5
        const exp1_2 = Math.floor(Math.random() * 2) + 4; // 4-5
        const exp2_2 = Math.floor(Math.random() * 2) + 1; // 1-2
        const resultExp1 = Math.floor(Math.random() * 2) + 2; // 2-3

        this.missingExponent = exp1_1 - resultExp1;
        const exp2_1 = this.missingExponent;

        return [
            [
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
                    ]),
                    hasMissing: true,
                    missingVar: var1
                }
            ],
            { 
                coefficient: resultCoef, 
                variables: new Map([
                    [var1, resultExp1],
                    [var2, exp1_2 - exp2_2]
                ]) 
            }
        ];
    }

    private generateLevel5(): [Term[], Term] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        const [var1, var2, var3] = vars;
        
        // 生成係數
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const resultCoef = Math.floor(Math.random() * 3) + 2; // 2-4
        const coef1 = coef2 * coef3 * resultCoef;

        // 生成指數
        const exp1 = Math.floor(Math.random() * 3) + 8; // 8-10
        const exp2 = Math.floor(Math.random() * 2) + 4; // 4-5
        const exp3 = Math.floor(Math.random() * 2) + 2; // 2-3
        const resultExp = Math.floor(Math.random() * 3) + 2; // 2-4

        this.missingExponent = exp2;

        return [
            [
                {
                    coefficient: coef1,
                    variables: new Map([
                        [var1, exp1],
                        [var2, exp1],
                        [var3, exp1]
                    ])
                },
                {
                    coefficient: coef2,
                    variables: new Map([
                        [var1, exp2],
                        [var2, exp2],
                        [var3, exp2]
                    ]),
                    hasMissing: true,
                    missingVar: var1
                },
                {
                    coefficient: coef3,
                    variables: new Map([
                        [var1, exp3],
                        [var2, exp3],
                        [var3, exp3]
                    ])
                }
            ],
            {
                coefficient: resultCoef,
                variables: new Map([
                    [var1, resultExp],
                    [var2, resultExp],
                    [var3, resultExp]
                ])
            }
        ];
    }

    private formatQuestion(terms: Term[], result: Term): [string, string, string] {
        // 格式化題目
        const questionParts = terms.map(term => {
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            const varPart = sortedVars.map(([variable, exp]) => {
                if (term.hasMissing && variable === term.missingVar) {
                    return variable + '^{\\Box}';
                }
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            }).join('');

            return term.coefficient === 1 ? varPart : term.coefficient + varPart;
        });

        // 格式化答案
        const sortedResultVars = Array.from(result.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b));
        
        const varPart = sortedResultVars.map(([variable, exp]) => {
            return exp === 1 ? variable : variable + '^{' + exp + '}';
        }).join('');

        const answer = result.coefficient === 1 ? varPart : result.coefficient + varPart;

        // 生成完整的等式
        const equation = `${questionParts.join(' \\div ')} = ${answer}`;

        // 生成解題步驟，使用 LaTeX 格式
        const steps = `解題步驟：
1. 找出已知的指數：
${Array.from(terms[0].variables.entries())
    .map(([v, e]) => `   \\(${v}: ${e}\\)`)
    .join('\n')}

2. 觀察最終答案中的指數：
${Array.from(result.variables.entries())
    .map(([v, e]) => `   \\(${v}: ${e}\\)`)
    .join('\n')}

3. 利用指數減法原理，求出缺少的指數：
   \\(${terms[1].missingVar}^{\\Box} = ${this.missingExponent}\\)`;

        return [equation, this.missingExponent.toString(), steps];
    }

    private generateWrongAnswers(correctAnswer: number, difficulty: number): string[] {
        const wrongAnswers = new Set<string>();
        
        // 生成錯誤答案的策略，避免 0 和負數
        const strategies = [
            // 加1
            () => (correctAnswer + 1).toString(),
            // 加2
            () => (correctAnswer + 2).toString(),
            // 減1（如果可能）
            () => correctAnswer > 1 ? (correctAnswer - 1).toString() : (correctAnswer + 3).toString(),
            // 乘2（如果在合理範圍內）
            () => {
                const result = correctAnswer * 2;
                return result <= 12 ? result.toString() : (correctAnswer + 1).toString();
            }
        ];

        // 生成三個不同的錯誤答案
        while (wrongAnswers.size < 3) {
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];
            const wrong = strategy();
            // 確保答案不是 0 或負數
            if (wrong !== '0' && parseInt(wrong) > 0 && 
                wrong !== correctAnswer.toString() && !wrongAnswers.has(wrong)) {
                wrongAnswers.add(wrong);
            }
        }

        return Array.from(wrongAnswers);
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 