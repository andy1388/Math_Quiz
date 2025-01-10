"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.F1L12_1_Generator_Q1 = void 0;
const QuestionGenerator_1 = require("../../../QuestionGenerator");
class F1L12_1_Generator_Q1 extends QuestionGenerator_1.QuestionGenerator {
    constructor(difficulty = 1) {
        super(difficulty, 'F1L12.1');
        this.VARIABLES = ['x', 'y', 'z', 'a', 'b', 'm', 'n', 'p', 'q', 'r'];
    }
    generate() {
        let terms = [];
        switch (this.difficulty) {
            case 1:
                terms = this.generateLevel1();
                break;
            case 2:
                terms = this.generateLevel2();
                break;
            case 3:
                terms = this.generateLevel3();
                break;
            case 4:
                terms = this.generateLevel4();
                break;
            case 5:
                terms = this.generateLevel5();
                break;
        }
        const [question, answer, steps] = this.formatQuestion(terms);
        const wrongAnswers = this.generateWrongAnswers(answer);
        return {
            question: question,
            correctAnswer: answer,
            wrongAnswers: wrongAnswers,
            explanation: steps
        };
    }
    generateLevel1() {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)]; // 只使用 x, y, z
        const exp1 = Math.floor(Math.random() * 4) + 1;
        const exp2 = Math.floor(Math.random() * 4) + 1;
        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }
    generateLevel2() {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const exp1 = Math.floor(Math.random() * 5) + 5;
        const exp2 = Math.floor(Math.random() * 5) + 5;
        const exp3 = Math.floor(Math.random() * 5) + 5;
        return [
            { coefficient: 1, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) },
            { coefficient: 1, variables: new Map([[variable, exp3]]) }
        ];
    }
    generateLevel3() {
        const variable = this.VARIABLES[Math.floor(Math.random() * 3)];
        const coef = Math.floor(Math.random() * 8) + 2;
        const exp1 = Math.floor(Math.random() * 9) + 1;
        const exp2 = Math.floor(Math.random() * 9) + 1;
        return [
            { coefficient: coef, variables: new Map([[variable, exp1]]) },
            { coefficient: 1, variables: new Map([[variable, exp2]]) }
        ];
    }
    generateLevel4() {
        const vars = this.VARIABLES.slice(0, 2);
        const exp1 = Math.floor(Math.random() * 9) + 1;
        const exp2 = Math.floor(Math.random() * 9) + 1;
        const exp3 = Math.floor(Math.random() * 9) + 1;
        const exp4 = Math.floor(Math.random() * 9) + 1;
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
    generateLevel5() {
        const vars = this.VARIABLES.slice(0, 3);
        const coef1 = Math.floor(Math.random() * 8) + 2;
        const coef2 = Math.floor(Math.random() * 8) + 2;
        return [
            {
                coefficient: coef1,
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 9) + 1],
                    [vars[1], Math.floor(Math.random() * 9) + 1],
                    [vars[2], Math.floor(Math.random() * 9) + 1]
                ])
            },
            {
                coefficient: coef2,
                variables: new Map([
                    [vars[0], Math.floor(Math.random() * 9) + 1],
                    [vars[1], Math.floor(Math.random() * 9) + 1],
                    [vars[2], Math.floor(Math.random() * 9) + 1]
                ])
            }
        ];
    }
    formatQuestion(terms) {
        // 格式化題目
        const questionParts = terms.map(term => {
            let termStr = '';
            if (term.coefficient !== 1)
                termStr += term.coefficient;
            term.variables.forEach((exp, variable) => {
                termStr += variable + (exp !== 1 ? exp : '');
            });
            return termStr;
        });
        // 計算答案
        const result = {
            coefficient: terms.reduce((acc, term) => acc * term.coefficient, 1),
            variables: new Map()
        };
        // 合併所有變量的指數
        terms.forEach(term => {
            term.variables.forEach((exp, variable) => {
                result.variables.set(variable, (result.variables.get(variable) || 0) + exp);
            });
        });
        // 格式化答案
        let answer = '';
        if (result.coefficient !== 1)
            answer += result.coefficient;
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
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
        while (wrongAnswers.length < 3) {
            const wrong = this.generateWrongAnswer(correctAnswer);
            if (!wrongAnswers.includes(wrong) && wrong !== correctAnswer) {
                wrongAnswers.push(wrong);
            }
        }
        return wrongAnswers;
    }
    generateWrongAnswer(correctAnswer) {
        // 解析正確答案
        const match = correctAnswer.match(/^(\d*)([a-z])(\d+)$/);
        if (!match)
            return correctAnswer;
        const [, coefficient, variable, exponent] = match;
        const coef = coefficient ? parseInt(coefficient) : 1;
        const exp = parseInt(exponent);
        // 生成錯誤答案的方式
        const errorType = Math.floor(Math.random() * 3);
        switch (errorType) {
            case 0: // 指數相加而不是相乘
                return `${variable}${exp - 1}`; // 減少一個指數
            case 1: // 指數相乘而不是相加
                return `${variable}${exp + 1}`; // 增加一個指數
            case 2: // 係數錯誤
                return `2${variable}${exp}`; // 添加係數2
            default:
                return correctAnswer;
        }
    }
}
exports.F1L12_1_Generator_Q1 = F1L12_1_Generator_Q1;
