import { QuestionGenerator, IGeneratorOutput } from '../../../QuestionGenerator';
import { FractionUtils } from '../../../../utils/FractionUtils';

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
        // 计算结果，使用分数运算
        let resultCoefficient: [number, number] = [terms[0].coefficient, 1];
        
        // 从第二项开始计算，每个数都作为分数处理
        for (let i = 1; i < terms.length; i++) {
            const term = terms[i];
            if (term.operation === 'divide') {
                resultCoefficient = FractionUtils.divide(
                    resultCoefficient,
                    [term.coefficient, 1]
                );
            } else {
                resultCoefficient = FractionUtils.multiply(
                    resultCoefficient,
                    [term.coefficient, 1]
                );
            }
        }

        const result: Term = {
            // 保持分数形式，不要转换为小数
            coefficient: resultCoefficient[0] / resultCoefficient[1],
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

        // 格式化答案时使用分数形式
        const answer = this.formatTermWithFraction(result, resultCoefficient);

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
        
        // 收集题目中出现的所有变量
        const questionVars = new Set<string>();
        terms.forEach(term => {
            term.variables.forEach((_, v) => questionVars.add(v));
        });
        
        // 解析正确答案
        const coeffMatch = correctAnswer.match(/^(\\frac{\\d+}{\\d+}|\\d+)?/);
        const coefficient = coeffMatch && coeffMatch[1] ? 
            (coeffMatch[1].startsWith('\\frac') ? 
                eval(coeffMatch[1].replace(/\\frac{(\d+)}{(\d+)}/, '$1/$2')) : 
                parseInt(coeffMatch[1])) : 1;

        // 只使用题目中出现的变量
        const varExps = new Map<string, number>();
        Array.from(questionVars).forEach(v => {
            const regex = new RegExp(`${v}(?:\\^{(\\d+)})?`, 'g');
            const match = regex.exec(correctAnswer);
            if (match) {
                const exp = match[1] ? parseInt(match[1]) : 1;
                varExps.set(v, exp);
            }
        });

        // 生成错误答案的策略
        const generateWrongAnswer = () => {
            const strategy = Math.floor(Math.random() * 4);
            const newVars = new Map(varExps);
            let newCoef = coefficient;

            switch (strategy) {
                case 0: // 部分指数加1或减1（确保结果为正）
                    newVars.forEach((exp, v) => {
                        const change = Math.random() < 0.5 ? 1 : -1;
                        const newExp = exp + change;
                        if (newExp > 0) {
                            newVars.set(v, newExp);
                        }
                    });
                    break;
                case 1: // 系数计算错误（保持在合理范围内）
                    if (coefficient !== 1) {
                        const changes = [2, 0.5, 1.5, 3];
                        const newCoefTemp = coefficient * changes[Math.floor(Math.random() * changes.length)];
                        if (newCoefTemp > 0 && newCoefTemp <= 20) {
                            newCoef = newCoefTemp;
                        }
                    }
                    break;
                case 2: // 交换两个变量的指数
                    const vars = Array.from(newVars.entries());
                    if (vars.length >= 2) {
                        const i = Math.floor(Math.random() * (vars.length - 1));
                        [vars[i][1], vars[i + 1][1]] = [vars[i + 1][1], vars[i][1]];
                        newVars.clear();
                        vars.forEach(([v, e]) => newVars.set(v, e));
                    }
                    break;
                case 3: // 某个指数加倍或减半（确保为正）
                    if (newVars.size > 0) {
                        const randomVar = Array.from(newVars.keys())[
                            Math.floor(Math.random() * newVars.size)
                        ];
                        const currentExp = newVars.get(randomVar)!;
                        const newExp = Math.random() < 0.5 ? 
                            currentExp * 2 : 
                            Math.max(1, Math.floor(currentExp / 2));
                        newVars.set(randomVar, newExp);
                    }
                    break;
            }

            return this.formatTerm({ coefficient: newCoef, variables: newVars });
        };

        // 生成三个不同的错误答案
        const maxAttempts = 20;
        let attempts = 0;
        
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            const wrongAnswer = generateWrongAnswer();
            if (wrongAnswer !== correctAnswer && !wrongAnswers.has(wrongAnswer)) {
                // 验证答案中只包含题目中出现的变量
                const containsOnlyQuestionVars = Array.from(wrongAnswer.matchAll(/[a-z]/g))
                    .every(match => questionVars.has(match[0]));
                
                if (containsOnlyQuestionVars) {
                    wrongAnswers.add(wrongAnswer);
                }
            }
            attempts++;
        }

        // 如果无法生成足够的错误答案，使用备用策略
        while (wrongAnswers.size < 3) {
            const backupAnswer = this.formatTerm({
                coefficient: coefficient * (wrongAnswers.size + 2),
                variables: new Map(varExps)
            });
            if (!wrongAnswers.has(backupAnswer)) {
                wrongAnswers.add(backupAnswer);
            }
        }

        return Array.from(wrongAnswers);
    }

    private formatTerm(term: Term): string {
        let coefficientStr = '';
        if (term.coefficient !== 1) {
            // 如果系数不是整数，直接转换为分数
            if (term.coefficient % 1 !== 0) {
                // 将小数转换为分数
                const [num, den] = term.coefficient.toString().split('.');
                const denominator = Math.pow(10, den.length);
                const numerator = parseInt(num + den);
                const [simplifiedNum, simplifiedDen] = FractionUtils.simplify(numerator, denominator);
                coefficientStr = FractionUtils.toLatex(simplifiedNum, simplifiedDen);
            } else {
                coefficientStr = term.coefficient.toString();
            }
        }
        
        if (term.variables.size === 0) return coefficientStr || '1';
        
        const sortedVars = Array.from(term.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            })
            .join('');
        
        return coefficientStr ? coefficientStr + sortedVars : sortedVars;
    }

    // 新增方法：使用分数形式格式化项
    private formatTermWithFraction(term: Term, coefficient: [number, number]): string {
        let coefficientStr = '';
        if (term.coefficient !== 1) {
            // 直接使用分数形式
            coefficientStr = FractionUtils.toLatex(coefficient[0], coefficient[1]);
        }
        
        if (term.variables.size === 0) return coefficientStr || '1';
        
        const sortedVars = Array.from(term.variables.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variable, exp]) => {
                return exp === 1 ? variable : variable + '^{' + exp + '}';
            })
            .join('');
        
        return coefficientStr ? coefficientStr + sortedVars : sortedVars;
    }
} 