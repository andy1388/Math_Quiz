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
            content: question,
            correctAnswer: answer,
            options: [answer, ...wrongAnswers],
            correctIndex: 0,
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
        
        // 解析正確答案中的係數和變量
        const coefficientMatch = correctAnswer.match(/^(\d+)?/);
        const coefficient = coefficientMatch && coefficientMatch[1] ? parseInt(coefficientMatch[1]) : 1;
        
        // 解析變量和指數
        const terms = new Map<string, number>();
        const regex = /([a-z])(\d+)/g;
        let match;
        while ((match = regex.exec(correctAnswer)) !== null) {
            const [, variable, exponent] = match;
            terms.set(variable, parseInt(exponent));
        }

        if (terms.size === 0) {
            console.error('無法解析正確答案:', correctAnswer);
            return ['ERROR', 'ERROR', 'ERROR'];
        }

        // 生成錯誤答案的策略
        const generateWrongAnswer = () => {
            const newTerms = new Map(terms);
            const newCoefficient = coefficient;  // 預設保持係數不變
            const strategy = Math.floor(Math.random() * 4);  // 增加策略數量
            
            switch (strategy) {
                case 0: // 改變一個變量的指數
                    const randomVar = Array.from(newTerms.keys())[Math.floor(Math.random() * newTerms.size)];
                    const currentExp = newTerms.get(randomVar)!;
                    newTerms.set(randomVar, currentExp + (Math.random() < 0.5 ? 1 : -1));
                    break;
                    
                case 1: // 交換兩個變量的指數
                    if (newTerms.size >= 2) {
                        const vars = Array.from(newTerms.entries());
                        const exp1 = vars[0][1];
                        vars[0][1] = vars[1][1];
                        vars[1][1] = exp1;
                        newTerms.clear();
                        vars.forEach(([v, e]) => newTerms.set(v, e));
                    }
                    break;
                    
                case 2: // 所有指數加1或減1
                    const change = Math.random() < 0.5 ? 1 : -1;
                    newTerms.forEach((exp, v) => {
                        newTerms.set(v, exp + change);
                    });
                    break;

                case 3: // 改變係數
                    if (difficulty >= 3) {  // 只在難度3以上改變係數
                        const coefficientChanges = [
                            coefficient + 1,
                            coefficient - 1,
                            coefficient * 2,
                            Math.floor(coefficient / 2)
                        ].filter(c => c > 0 && c !== coefficient);
                        
                        const newCoef = coefficientChanges[Math.floor(Math.random() * coefficientChanges.length)];
                        return `${newCoef}${Array.from(newTerms.entries())
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([v, e]) => `${v}${e}`)
                            .join('')}`;
                    }
                    break;
            }

            // 構建錯誤答案字符串
            const wrongAnswer = Array.from(newTerms.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([v, e]) => `${v}${e}`)
                .join('');
                
            return coefficient !== 1 ? `${coefficient}${wrongAnswer}` : wrongAnswer;
        };

        // 生成三個不同的錯誤答案
        const maxAttempts = 15;  // 增加嘗試次數
        let attempts = 0;
        
        while (wrongAnswers.length < 3 && attempts < maxAttempts) {
            const wrong = generateWrongAnswer();
            if (!wrongAnswers.includes(wrong) && wrong !== correctAnswer) {
                wrongAnswers.push(wrong);
            }
            attempts++;
        }

        // 如果無法生成足夠的錯誤答案，使用備用策略
        while (wrongAnswers.length < 3) {
            const backupWrong = coefficient !== 1 
                ? `${coefficient + wrongAnswers.length + 1}${Array.from(terms.entries())
                    .map(([v, e]) => `${v}${e}`)
                    .join('')}`
                : Array.from(terms.entries())
                    .map(([v, e]) => `${v}${e + wrongAnswers.length + 1}`)
                    .join('');
                    
            if (!wrongAnswers.includes(backupWrong)) {
                wrongAnswers.push(backupWrong);
            }
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

        // 生成解題步驟，全部使用 LaTeX 格式
        const steps = `解題步驟：
1. 係數相乘：\\(${terms.map(t => t.coefficient).join(' \\times ')} = ${result.coefficient}\\)
2. 同類項指數相加：
${Array.from(result.variables.entries())
    .map(([v, e]) => `   \\(${v}: ${terms.map(t => t.variables.get(v) || 0).join(' + ')} = ${e}\\)`)
    .join('\n')}
3. 最終答案：\\(${result.coefficient}${
    sortedVars.map(([v, e]) => v + '^{' + e + '}').join('')
}\\)`;

        return [questionParts.join(' × '), answer, steps];
    }
} 