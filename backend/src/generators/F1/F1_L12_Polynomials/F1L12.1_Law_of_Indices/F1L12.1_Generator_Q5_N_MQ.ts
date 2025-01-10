import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';

interface Term {
    coefficient: number;
    variables: Map<string, number>;
    operation?: 'multiply' | 'divide';  // 标记这个项是乘还是除
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
            case 1: // 简单：两步运算，单一变量
                terms = this.generateLevel1();
                break;
            case 2: // 中等：三步运算，单一变量
                terms = this.generateLevel2();
                break;
            case 3: // 较难：两步运算，双变量
                terms = this.generateLevel3();
                break;
            case 4: // 进阶：三步运算，双变量
                terms = this.generateLevel4();
                break;
            case 5: // 挑战：多步运算，多变量和系数
                terms = this.generateLevel5();
                break;
            default:
                throw new Error(`难度等级 ${this.difficulty} 不可用`);
        }

        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer, terms);
        
        // 随机打乱选项并记录正确答案的新位置
        const options = [answer, ...wrongAnswers];
        const shuffledOptions = this.shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(answer);

        return {
            content: question,
            correctAnswer: answer,
            options: shuffledOptions,
            correctIndex: correctIndex,
            explanation: steps
        };
    }

    protected generateLevel1(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp2 = Math.floor(Math.random() * 4) + 2; // 2-5
        const exp3 = Math.floor(Math.random() * 2) + 1; // 1-2，确保除法后指数为正

        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exp2]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exp3]]), operation: 'divide' }
        ];
    }

    protected generateLevel2(): Term[] {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exponents = Array.from({length: 4}, () => Math.floor(Math.random() * 3) + 2); // 2-4
        
        return [
            { coefficient: 1, variables: new Map([[variable, exponents[0]]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exponents[1]]]), operation: 'multiply' },
            { coefficient: 1, variables: new Map([[variable, exponents[2]]]), operation: 'divide' },
            { coefficient: 1, variables: new Map([[variable, exponents[3]]]), operation: 'multiply' }
        ];
    }

    protected generateLevel3(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        
        return [
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1],
                    [var2, Math.floor(Math.random() * 2) + 1]
                ]),
                operation: 'divide'
            }
        ];
    }

    protected generateLevel4(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3)).slice(0, 2);
        const [var1, var2] = vars;
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        
        return [
            { 
                coefficient: coef1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 3],
                    [var2, Math.floor(Math.random() * 3) + 3]
                ]),
                operation: 'multiply'
            },
            { 
                coefficient: coef2, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 3) + 2],
                    [var2, Math.floor(Math.random() * 3) + 2]
                ]),
                operation: 'divide'
            },
            { 
                coefficient: 1, 
                variables: new Map([
                    [var1, Math.floor(Math.random() * 2) + 1],
                    [var2, Math.floor(Math.random() * 2) + 1]
                ]),
                operation: 'multiply'
            }
        ];
    }

    protected generateLevel5(): Term[] {
        const vars = this.shuffleArray(this.VARIABLES.slice(0, 3));
        const coef1 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef2 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        const coef3 = this.EASY_COEFFICIENTS[Math.floor(Math.random() * this.EASY_COEFFICIENTS.length)];
        
        return [
            {
                coefficient: coef1,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 3) + 2])
                ),
                operation: 'multiply'
            },
            {
                coefficient: coef2,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 3) + 2])
                ),
                operation: 'multiply'
            },
            {
                coefficient: coef3,
                variables: new Map(
                    vars.map(v => [v, Math.floor(Math.random() * 2) + 1])
                ),
                operation: 'divide'
            }
        ];
    }

    protected formatQuestion(terms: Term[]): [string, string, string] {
        // 计算结果
        const result: Term = {
            coefficient: terms.reduce((acc, term) => {
                return term.operation === 'divide' ? 
                    acc / term.coefficient : 
                    acc * term.coefficient;
            }, 1),
            variables: new Map()
        };

        // 计算每个变量的最终指数
        const allVars = new Set<string>();
        terms.forEach(term => term.variables.forEach((_, v) => allVars.add(v)));

        allVars.forEach(variable => {
            let finalExp = 0;
            terms.forEach(term => {
                const exp = term.variables.get(variable) || 0;
                finalExp = term.operation === 'divide' ? 
                    finalExp - exp : 
                    finalExp + exp;
            });
            if (finalExp !== 0) {
                result.variables.set(variable, finalExp);
            }
        });

        // 格式化题目
        const questionParts = terms.map((term, index) => {
            let termStr = '';
            if (term.coefficient !== 1) termStr += term.coefficient;
            
            const sortedVars = Array.from(term.variables.entries())
                .sort(([a], [b]) => a.localeCompare(b));
            
            sortedVars.forEach(([variable, exp]) => {
                termStr += variable + (exp !== 1 ? '^{' + exp + '}' : '');
            });
            
            return index === 0 ? termStr : (term.operation === 'divide' ? ' \\div ' + termStr : ' \\times ' + termStr);
        });

        // 格式化答案
        const answer = this.formatTerm(result);

        // 生成解题步骤，使用 LaTeX 格式
        const steps = `解題步驟：
1. 係數運算：
   \\[${terms.reduce((str, term, index) => {
       if (index === 0) return term.coefficient.toString();
       return str + (term.operation === 'divide' ? ' \\div ' : ' \\times ') + term.coefficient;
   }, '')} = ${result.coefficient}\\]

2. 指數運算：
${Array.from(allVars).sort().map(v => {
    const exps = terms.map(t => t.variables.get(v) || 0);
    return `   \\[${v}: ${exps.reduce((str, exp, index) => {
        if (index === 0) return exp.toString();
        const op = terms[index].operation === 'divide' ? ' - ' : ' + ';
        return str + op + exp;
    }, '')} = ${result.variables.get(v) || 0}\\]`;
}).join('\n')}

3. 最終答案：\\[${answer}\\]`;

        return [questionParts.join(''), answer, steps];
    }

    protected generateWrongAnswers(correctAnswer: string, terms: Term[]): string[] {
        const wrongAnswers = new Set<string>();
        
        // 解析正确答案
        const coeffMatch = correctAnswer.match(/^(\d+)?/);
        const coefficient = coeffMatch && coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
        
        const varExps = new Map<string, number>();
        const varRegex = /([a-z])(?:\^{(\d+)})?/g;
        let match;
        while ((match = varRegex.exec(correctAnswer)) !== null) {
            const [, variable, expStr] = match;
            const exp = expStr ? parseInt(expStr) : 1;
            varExps.set(variable, exp);
        }

        // 生成错误答案的策略
        while (wrongAnswers.size < 3) {
            const strategy = Math.floor(Math.random() * 4);
            const newVars = new Map(varExps);
            let newCoef = coefficient;

            switch (strategy) {
                case 0: // 所有指数加1
                    newVars.forEach((exp, v) => newVars.set(v, exp + 1));
                    break;
                case 1: // 系数计算错误
                    newCoef = coefficient * 2;
                    break;
                case 2: // 某个指数计算错误
                    if (newVars.size > 0) {
                        const randomVar = Array.from(newVars.keys())[
                            Math.floor(Math.random() * newVars.size)
                        ];
                        newVars.set(randomVar, newVars.get(randomVar)! + 2);
                    }
                    break;
                case 3: // 混合错误
                    newCoef = Math.floor(coefficient * 1.5);
                    newVars.forEach((exp, v) => newVars.set(v, exp - 1));
                    break;
            }

            const wrongAnswer = this.formatTerm({ coefficient: newCoef, variables: newVars });
            if (wrongAnswer !== correctAnswer) {
                wrongAnswers.add(wrongAnswer);
            }
        }

        return Array.from(wrongAnswers);
    }

    private formatTerm(term: Term): string {
        if (term.variables.size === 0) return term.coefficient.toString();
        
        const sortedVars = Array.from(term.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            })
            .join('');
        
        return term.coefficient === 1 ? sortedVars : term.coefficient + sortedVars;
    }
} 