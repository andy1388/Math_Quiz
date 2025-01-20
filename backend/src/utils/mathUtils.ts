/**
 * 數學工具模組 - 提供常用的數學運算和工具函數
 */

// 常用數學常數
export const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2
} as const;

// 變量名稱集合
export const VARIABLE_NAMES = ['x', 'y', 'z', 'a', 'b', 'c'] as const;

/**
 * 數值範圍類型
 */
export interface NumberRange {
    min: number;
    max: number;
}

/**
 * 生成隨機整數
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成隨機小數（指定小數位數）
 */
export function getRandomDecimal(min: number, max: number, decimals: number = 1): number {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

/**
 * 生成非零隨機整數
 */
export function getNonZeroRandomInt(min: number, max: number): number {
    let num;
    do {
        num = getRandomInt(min, max);
    } while (num === 0);
    return num;
}

/**
 * 生成係數（排除特定數值）
 */
export function generateCoefficient(range: NumberRange, exclude: number[] = [0]): number {
    let coefficient;
    do {
        coefficient = getRandomInt(range.min, range.max);
    } while (exclude.includes(coefficient));
    return coefficient;
}

/**
 * 格式化數字（處理正負號）
 */
export function formatNumber(num: number): string {
    if (num >= 0) {
        return `+${num}`;
    }
    return num.toString();
}

/**
 * 格式化係數（省略1和-1）
 */
export function formatCoefficient(coefficient: number, variable: string): string {
    if (coefficient === 1) return variable;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient}${variable}`;
}

/**
 * 最大公約數
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

/**
 * 最小公倍數
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * 約分分數
 */
export function reduceFraction(numerator: number, denominator: number): [number, number] {
    const divisor = gcd(numerator, denominator);
    return [numerator / divisor, denominator / divisor];
}

/**
 * 檢查是否為整數
 */
export function isInteger(num: number): boolean {
    return Number.isInteger(num);
}

/**
 * 生成指定範圍內的隨機整數解
 */
export function generateIntegerSolution(range: NumberRange): number {
    return getRandomInt(range.min, range.max);
}

/**
 * LaTeX 格式化工具
 */
export const LaTeX = {
    /**
     * 格式化一次項
     */
    formatLinearTerm(coefficient: number, variable: string = 'x'): string {
        if (coefficient === 0) return '';
        if (coefficient === 1) return variable;
        if (coefficient === -1) return `-${variable}`;
        return `${coefficient}${variable}`;
    },

    /**
     * 格式化常數項
     */
    formatConstant(constant: number): string {
        if (constant === 0) return '';
        return constant > 0 ? `+${constant}` : constant.toString();
    },

    /**
     * 格式化分數
     */
    formatFraction(numerator: number, denominator: number): string {
        return `\\frac{${numerator}}{${denominator}}`;
    }
};

/**
 * 題目難度相關工具
 */
export const DifficultyUtils = {
    /**
     * 根據難度調整數值範圍
     */
    adjustRange(baseRange: NumberRange, difficulty: number): NumberRange {
        const multiplier = 1 + (difficulty - 1) * 0.5;
        return {
            min: Math.floor(baseRange.min * multiplier),
            max: Math.ceil(baseRange.max * multiplier)
        };
    },

    /**
     * 根據難度決定是否使用小數
     */
    shouldUseDecimals(difficulty: number): boolean {
        return difficulty >= 4;
    },

    /**
     * 根據難度決定小數位數
     */
    getDecimalPlaces(difficulty: number): number {
        if (difficulty <= 3) return 0;
        return difficulty - 3;
    }
};

// 導出默認配置
export const DEFAULT_CONFIG = {
    INTEGER_RANGE: { min: -20, max: 20 },
    COEFFICIENT_RANGE: { min: -12, max: 12 },
    DECIMAL_PLACES: 1,
    VARIABLE_NAMES: ['x', 'y', 'z'] as const
} as const;

/**
 * 表達式分析工具
 */
export const ExpressionAnalyzer = {
    /**
     * 分析表達式的完整信息
     */
    analyze(latex: string): ExpressionInfo {
        return {
            type: this.getExpressionType(latex),
            termCount: this.countTerms(latex),
            fractionInfo: this.analyzeFraction(latex),
            irrationalInfo: this.analyzeIrrational(latex),
            variables: this.findVariables(latex),
            likeTerms: this.analyzeLikeTerms(latex)
        };
    },

    /**
     * 清理 LaTeX 表達式
     */
    _cleanLatex(latex: string): string {
        // 移除空格
        let clean = latex.replace(/\s+/g, '');
        // 標準化負號
        clean = clean.replace(/−/g, '-');
        // 處理開頭的負號
        clean = clean.replace(/^-/, 'NEG');  // 暫時替換開頭的負號
        return clean;
    },

    /**
     * 獲取表達式類型
     */
    getExpressionType(latex: string): ExpressionType {
        const cleanLatex = this._cleanLatex(latex);
        
        // 還原 NEG 為負號
        const finalLatex = cleanLatex.replace('NEG', '-');
        
        // 檢查是否有加號或減號（不在括號內的）
        const hasOuterOperators = this._hasOuterOperators(finalLatex);
        
        if (hasOuterOperators) {
            return 'polynomial';
        }
        
        // 檢查是否是括號表達式
        if (finalLatex.includes('(')) {
            // 檢查括號前的部分是否為單項式
            const beforeBracket = finalLatex.split('(')[0].replace('NEG', '-');
            
            // 檢查是否為單項式（包括負號情況）
            const isSingleTerm = /^-?(\d*x?|\d+)$/.test(beforeBracket);
            
            if (isSingleTerm) {
                return 'monomial';
            }
        }
        
        // 其他情況的判斷
        const hasVariable = /[a-zA-Z]/.test(finalLatex);
        const hasMultipleTerms = /[+\-]/.test(finalLatex.replace(/^-/, '')); // 忽略開頭的負號

        if (!hasVariable && !hasMultipleTerms) return 'constant';
        if (!hasVariable && hasMultipleTerms) return 'numerical';
        if (hasVariable && !hasMultipleTerms) return 'monomial';
        return 'polynomial';
    },

    /**
     * 計算項數
     */
    countTerms(latex: string): number {
        const cleanLatex = this._cleanLatex(latex);
        const finalLatex = cleanLatex.replace('NEG', '-');
        
        // 計算外部運算符的數量
        const outerOperators = this._getOuterOperators(finalLatex);
        if (outerOperators.length > 0) {
            return outerOperators.length + 1;
        }
        
        // 如果是單項式乘以括號，返回1
        if (finalLatex.includes('(')) {
            const beforeBracket = finalLatex.split('(')[0].replace('NEG', '-');
            const isSingleTerm = /^-?(\d*x?|\d+)$/.test(beforeBracket);
            if (isSingleTerm) {
                return 1;
            }
        }
        
        // 如果是常數或單項式，返回1
        if (!this._hasMultipleTerms(finalLatex.replace(/^-/, ''))) return 1;
        
        // 計算運算符數量並加1（忽略開頭的負號）
        const operators = finalLatex.replace(/^-/, '').match(/[+\-]/g) || [];
        return operators.length + 1;
    },

    /**
     * 分析分數相關信息
     */
    analyzeFraction(latex: string): FractionInfo {
        return {
            hasFraction: latex.includes('\\frac'),
            hasNestedFraction: this._hasNestedFraction(latex),
            fractionCount: (latex.match(/\\frac/g) || []).length,
            nestedLevel: this._getNestedFractionLevel(latex)
        };
    },

    /**
     * 分析無理數相關信息
     */
    analyzeIrrational(latex: string): IrrationalInfo {
        return {
            hasIrrational: this._hasIrrational(latex),
            types: {
                hasSquareRoot: latex.includes('\\sqrt'),
                hasPi: latex.includes('\\pi'),
                hasE: latex.includes('\\e')
            },
            count: this._countIrrationalTerms(latex)
        };
    },

    /**
     * 查找所有變量
     */
    findVariables(latex: string): VariableInfo {
        // 首先清理 LaTeX 命令
        const cleanLatex = this._removeLatexCommands(latex);
        
        // 只匹配独立的字母（不是LaTeX命令的一部分）
        const variables = new Set(
            cleanLatex.match(/(?<![\\{])[a-zA-Z](?![a-zA-Z}])/g) || []
        );

        return {
            hasVariables: variables.size > 0,
            count: variables.size,
            list: Array.from(variables)
        };
    },

    /**
     * 移除 LaTeX 命令
     */
    _removeLatexCommands(latex: string): string {
        return latex
            // 移除 \frac 命令
            .replace(/\\frac\{[^{}]*\}\{[^{}]*\}/g, '')
            // 移除 \sqrt 命令
            .replace(/\\sqrt\{[^{}]*\}/g, '')
            // 移除其他常见的 LaTeX 命令
            .replace(/\\[a-zA-Z]+/g, '')
            // 移除花括号
            .replace(/[\{\}]/g, '')
            // 移除空格
            .replace(/\s+/g, '');
    },

    // 輔助方法
    _hasMultipleTerms(latex: string): boolean {
        return /[+\-]/.test(latex);
    },

    _hasNestedFraction(latex: string): boolean {
        const nestedPattern = /\\frac\{[^{}]*\\frac[^{}]*\}/;
        return nestedPattern.test(latex);
    },

    _getNestedFractionLevel(latex: string): number {
        let level = 0;
        let maxLevel = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex.slice(i).startsWith('\\frac')) {
                level++;
                maxLevel = Math.max(maxLevel, level);
            }
            if (latex[i] === '}') level--;
        }
        return maxLevel;
    },

    _hasIrrational(latex: string): boolean {
        return latex.includes('\\sqrt') || 
               latex.includes('\\pi') || 
               latex.includes('\\e');
    },

    _countIrrationalTerms(latex: string): number {
        const irrationalMatches = latex.match(/\\(?:sqrt|pi|e)/g) || [];
        return irrationalMatches.length;
    },

    /**
     * 分析同類項
     */
    analyzeLikeTerms(latex: string): LikeTermsInfo {
        // 移除等号及其后面的内容
        const expressionPart = latex.split('=')[0];
        const cleanLatex = this._cleanLatex(expressionPart);
        const terms = this._splitTerms(cleanLatex);
        const groups = new Map<string, string[]>();

        // 分析每个项
        terms.forEach(term => {
            // 提取变量和系数
            const { coefficient, variable } = this._parseTermParts(term);
            
            // 对于纯数字项（包括小数），使用特殊标识
            const key = this._isNumeric(term) ? 'numeric' : (variable || 'constant');
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)?.push(term);
        });

        // 构建结果
        const likeTermGroups = Array.from(groups.entries())
            .filter(([_, terms]) => terms.length > 1)  // 只保留有同类项的组
            .map(([variable, terms]) => ({
                variable: variable === 'numeric' ? '數值項' : (variable || '常數項'),
                terms,
                count: terms.length
            }));

        return {
            hasLikeTerms: likeTermGroups.length > 0,
            groups: likeTermGroups
        };
    },

    /**
     * 检查是否为数值（包括小数）
     */
    _isNumeric(term: string): boolean {
        // 移除前导的加减号
        const cleanTerm = term.replace(/^[+-]/, '');
        // 检查是否为数字（包括小数）
        return !isNaN(parseFloat(cleanTerm)) && cleanTerm.length > 0;
    },

    /**
     * 分割項
     */
    _splitTerms(latex: string): string[] {
        // 处理第一项可能的正号
        const normalized = latex.replace(/^\+/, '');
        
        // 分割并保留正负号
        return normalized
            .replace(/\s+/g, '')
            .split(/(?=[+-])/)
            .filter(term => term.length > 0)
            .map(term => term.trim());
    },

    /**
     * 解析項的各部分
     */
    _parseTermParts(term: string): { coefficient: string; variable: string } {
        // 移除前导的加号
        term = term.replace(/^\+/, '');
        
        // 如果是纯数字（包括小数），返回系数，无变量
        if (this._isNumeric(term)) {
            return {
                coefficient: term,
                variable: ''
            };
        }
        
        // 匹配系数和变量部分
        const match = term.match(/^([+-]?\d*\.?\d*)(.*?)$/);
        if (!match) {
            return { coefficient: '', variable: term };
        }

        let [, coefficient, variable] = match;
        
        // 处理特殊情况
        if (coefficient === '' || coefficient === '+') coefficient = '1';
        if (coefficient === '-') coefficient = '-1';
        
        return {
            coefficient: coefficient,
            variable: variable.trim()
        };
    },

    /**
     * 標準化變量部分
     */
    _standardizeVariables(variables: string): string {
        // 處理指數
        const parts = variables.split('^');
        if (parts.length > 1) {
            // 如果有指數，保持原樣
            return variables;
        }

        // 如果沒有指數，按字母排序
        const chars = variables.split('');
        return chars.sort().join('');
    },

    /**
     * 標準化根式
     */
    _standardizeRoot(root: string): string {
        // 移除空格
        root = root.replace(/\s+/g, '');
        // 如果是純數字的根號，保持原樣
        if (root.match(/^\\sqrt\{\d+\}$/)) {
            return root;
        }
        return root;
    },

    /**
     * 標準化函數
     */
    _standardizeFunction(term: string): string {
        // 匹配所有支持的函數
        const functions = [
            // 三角函數
            '\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot',
            // 對數函數
            '\\ln', '\\log'
        ];

        // 完整匹配函數及其參數
        for (const func of functions) {
            if (term.startsWith(func)) {
                // 提取函數參數
                const paramMatch = term.match(/^\\[a-z]+\{([^{}]+)\}$/);
                if (paramMatch) {
                    const [_, param] = paramMatch;
                    return `${func}{${param}}`; // 保持完整的函數形式
                }
            }
        }
        return term;
    },

    /**
     * 合併同類項
     */
    combineTerms(expression: string): string {
        try {
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Processing expression:', expr);

            // 首先处理分数和根号
            const parts = expr.split(/([+-])/g).filter(part => part.trim());
            let processedExpr = '';
            let currentSign = '+';

            for (let i = 0; i < parts.length; i++) {
                let part = parts[i].trim();
                
                if (part === '+' || part === '-') {
                    currentSign = part;
                    continue;
                }

                // 处理根号
                if (part.includes('\\sqrt')) {
                    const standardRoot = this._standardizeRoot(part);
                    processedExpr += currentSign + standardRoot;
                } else if (part.includes('\\frac')) {
                    const fractionMatch = part.match(/\\frac\{(\d+)\}\{(\d+)\}/);
                    if (fractionMatch) {
                        const [_, num, den] = fractionMatch;
                        const decimal = parseInt(num) / parseInt(den);
                        processedExpr += currentSign + decimal;
                    }
                } else {
                    processedExpr += currentSign + part;
                }
            }

            // 移除开头的加号
            processedExpr = processedExpr.replace(/^\+/, '');

            // 分离各项
            const terms = processedExpr.replace(/\s+/g, '')
                .replace(/([+-])((?:\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\ln|\\log|[a-zA-Z\\]))/g, '$11$2')
                .replace(/^((?:\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\ln|\\log|[a-zA-Z\\]))/g, '1$1')
                .match(/[+-]?(?:\d*\.?\d*)?(?:\\(?:sin|cos|tan|csc|sec|cot|ln|log)\{[^{}]+\}|\\sqrt\{[^{}]+\}|[a-zA-Z0-9^]+)|[+-]?\d+\.?\d*/g)
                ?.filter(term => term !== '');

            if (!terms) {
                throw new Error('無效的表達式');
            }

            // 用于存储同类项的系数和
            const termGroups = new Map<string, number>();

            // 处理每一项
            terms.forEach(term => {
                // 处理纯数字项
                if (/^[+-]?\d*\.?\d*$/.test(term)) {
                    const num = parseFloat(term);
                    termGroups.set('', (termGroups.get('') || 0) + num);
                    return;
                }

                // 分离系数和变量/根号部分
                const match = term.match(/([+-]?\d*\.?\d*)?(.+)/);
                if (!match) return;

                let [_, coefficient, variable] = match;
                if (!coefficient || coefficient === '+') coefficient = '1';
                if (coefficient === '-') coefficient = '-1';

                // 标准化变量或函数部分
                const standardTerm = 
                    variable.match(/^\\(?:sin|cos|tan|csc|sec|cot|ln|log)\{[^{}]+\}$/) ? this._standardizeFunction(variable) :
                    variable.includes('\\sqrt') ? this._standardizeRoot(variable) : 
                    this._standardizeVariables(variable);
                
                // 累加系数
                const coef = parseFloat(coefficient);
                termGroups.set(standardTerm, (termGroups.get(standardTerm) || 0) + coef);
            });

            // 构建结果
            let result = Array.from(termGroups.entries())
                .filter(([_, coef]) => Math.abs(coef) > 1e-10)
                .sort(([term1, _1], [term2, _2]) => {
                    if (!term1) return 1;
                    if (!term2) return -1;
                    // 根号优先
                    const isRoot1 = term1.startsWith('\\sqrt');
                    const isRoot2 = term2.startsWith('\\sqrt');
                    if (isRoot1 !== isRoot2) return isRoot2 ? 1 : -1;
                    return term1.localeCompare(term2);
                })
                .map(([term, coefficient]) => {
                    const formattedCoef = this._formatCoefficient(coefficient);
                    if (term === '') {
                        return coefficient > 0 ? `+${formattedCoef}` : formattedCoef;
                    }
                    if (coefficient === 1) return `+${term}`;
                    if (coefficient === -1) return `-${term}`;
                    return coefficient > 0 ? `+${formattedCoef}${term}` : `${formattedCoef}${term}`;
                })
                .join('');

            // 处理结果的开头的加号
            result = result.replace(/^\+/, '');
            
            // 如果结果为空，返回0
            if (!result) result = '0';

            console.log('Combined result:', result);

            return equals ? `${result}=${equals}` : result;
        } catch (error) {
            console.error('Combine terms error:', error);
            throw error;
        }
    },

    /**
     * 格式化系数
     */
    _formatCoefficient(num: number): string {
        // 检查是否为整数
        if (Number.isInteger(num)) {
            return num.toString();
        }
        
        // 处理小数，最多保留5位小数
        const rounded = Number(num.toFixed(5));
        // 如果舍入后变成整数，返回整数
        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }
        // 否则返回小数形式
        return rounded.toString();
    },

    /**
     * 计算循环小数对应的分数
     */
    calculateFractionFromRecurring(nonRepeating: string, repeating: string): [number, number] {
        // 处理整数部分和小数部分
        const parts = nonRepeating.split('.');
        const integerPart = parts[0] || '0';  // 整数部分
        const decimalPart = parts[1] || '';    // 小数部分
        
        // 计算分子和分母
        const base = Math.pow(10, decimalPart.length);
        const repLen = repeating.length;
        const factor = Math.pow(10, repLen) - 1;
        
        // 构造分数
        const decimal = parseInt(decimalPart || '0');
        const rep = parseInt(repeating);
        const numerator = (decimal * factor + rep) + (parseInt(integerPart) * base * factor);
        const denominator = factor * base;
        
        // 约分
        const gcd = this.gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    },

    /**
     * 计算分数的小数表示
     */
    calculateDecimalFromFraction(numerator: number, denominator: number): string {
        let dividend = numerator;
        let quotient = Math.floor(dividend / denominator);
        let remainders: number[] = [];
        let decimals: number[] = [];
        
        dividend = (dividend % denominator) * 10;
        
        while (dividend !== 0 && !remainders.includes(dividend)) {
            remainders.push(dividend);
            decimals.push(Math.floor(dividend / denominator));
            dividend = (dividend % denominator) * 10;
        }
        
        if (dividend === 0) {
            // 有限小数
            return quotient + (decimals.length > 0 ? '.' + decimals.join('') : '');
        } else {
            // 循环小数
            const cycleStartIndex = remainders.indexOf(dividend);
            const nonRepeating = decimals.slice(0, cycleStartIndex).join('');
            const repeating = decimals.slice(cycleStartIndex).join('');
            
            return `${quotient}${nonRepeating.length > 0 ? '.' + nonRepeating : ''}.\\overline{${repeating}}`;
        }
    },

    /**
     * 辅助方法：最大公约数
     */
    gcd(a: number, b: number): number {
        return b === 0 ? Math.abs(a) : this.gcd(b, a % b);
    },

    /**
     * 将小数转换为分数
     */
    decimalToFraction(decimal: number): [number, number] {
        const precision = 1e5; // 5位小数精度
        let numerator = Math.round(decimal * precision);
        let denominator = precision;
        
        // 约分
        const gcd = this.gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    },

    /**
     * 在小数和分数之间转换
     */
    convertDecimalFraction(expression: string): string {
        try {
            // 移除等号及其后面的内容
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Processing expression:', expr); // 添加日志

            let converted: string;
            
            // 首先尝试匹配完整的 LaTeX 分数格式
            const fractionMatch = expr.match(/\\frac\s*\{(\d+)\}\s*\{(\d+)\}/);
            if (fractionMatch) {
                console.log('Matched fraction:', fractionMatch); // 添加日志
                // 如果是分数，直接提取分子分母并计算
                const [_, numerator, denominator] = fractionMatch;
                if (!numerator || !denominator || parseInt(denominator) === 0) {
                    throw new Error('無效的分數格式');
                }
                const num = parseInt(numerator);
                const den = parseInt(denominator);
                
                // 如果分母为1，直接返回分子
                if (den === 1) {
                    converted = num.toString();
                } else {
                    const decimal = num / den;
                    
                    // 检查是否为循环小数
                    const remainders: number[] = [];
                    let dividend = (num % den) * 10;
                    let decimals: number[] = [];
                    
                    while (dividend !== 0 && !remainders.includes(dividend)) {
                        remainders.push(dividend);
                        decimals.push(Math.floor(dividend / den));
                        dividend = (dividend % den) * 10;
                    }
                    
                    if (dividend === 0) {
                        // 有限小数，保留到小数点后5位，并移除末尾的0
                        converted = decimal.toFixed(5).replace(/\.?0+$/, '');
                    } else {
                        // 循环小数
                        const cycleStartIndex = remainders.indexOf(dividend);
                        const integerPart = Math.floor(decimal);
                        const nonRepeating = decimals.slice(0, cycleStartIndex).join('');
                        const repeating = decimals.slice(cycleStartIndex).join('');
                        
                        converted = `${integerPart}${nonRepeating.length > 0 ? '.' + nonRepeating : ''}.\\overline{${repeating}}`;
                    }
                }
            } else if (expr.includes('\\overline')) {
                // 如果是循环小数，转换为分数
                converted = expr.replace(/(\d*\.?\d*)?\\overline\{(\d+)\}/g, (_, nonRepeating = '', repeating) => {
                    if (!repeating) {
                        throw new Error('無效的循環小數格式');
                    }
                    const [numerator, denominator] = this.calculateFractionFromRecurring(nonRepeating, repeating);
                    return `\\frac{${numerator}}{${denominator}}`;
                });
            } else if (expr.match(/\d+\.\d+/)) {
                // 如果是普通小数，转换为分数
                converted = expr.replace(/\d+\.\d+/g, (match) => {
                    if (isNaN(parseFloat(match))) {
                        throw new Error('無效的小數格式');
                    }
                    const [numerator, denominator] = this.decimalToFraction(parseFloat(match));
                    return `\\frac{${numerator}}{${denominator}}`;
                });
            } else if (expr.match(/^\s*\d+\s*$/)) {
                // 如果是整数，转换为分数形式
                const num = parseInt(expr.trim());
                converted = `\\frac{${num}}{1}`;
            } else {
                throw new Error('無法識別的表達式格式');
            }

            console.log('Conversion result:', converted); // 添加日志

            // 添加等号部分（如果有）
            return equals ? `${converted}=${equals}` : converted;
        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        }
    },

    /**
     * 约分分数
     */
    reduceFraction(expression: string): string {
        try {
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Processing fraction reduction:', expr);

            let num: number, den: number;

            // 首先尝试匹配 LaTeX 分数格式
            const fractionMatch = expr.match(/\\frac\s*\{([\d.]+)\}\s*\{([\d.]+)\}/);
            if (fractionMatch) {
                // 使用数组解构，跳过第一个元素
                const [, numerator, denominator] = fractionMatch;
                num = parseFloat(numerator);
                den = parseFloat(denominator);
            } else {
                // 尝试匹配普通除法格式 (a/b)
                const divisionMatch = expr.match(/([\d.]+)\s*\/\s*([\d.]+)/);
                if (divisionMatch) {
                    // 使用数组解构，跳过第一个元素
                    const [, numerator, denominator] = divisionMatch;
                    num = parseFloat(numerator);
                    den = parseFloat(denominator);
                } else {
                    throw new Error('不是有效的分數格式');
                }
            }

            if (isNaN(num) || isNaN(den)) {
                throw new Error('無效的數字格式');
            }

            if (den === 0) {
                throw new Error('分母不能為零');
            }

            // 处理小数点
            const getDecimalPlaces = (n: number): number => {
                const str = n.toString();
                const decimalIndex = str.indexOf('.');
                return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
            };

            // 获取分子分母中小数位数的最大值
            const numDecimals = getDecimalPlaces(num);
            const denDecimals = getDecimalPlaces(den);
            const maxDecimals = Math.max(numDecimals, denDecimals);

            // 将分子分母同时乘以10的幂次来消除小数
            if (maxDecimals > 0) {
                const factor = Math.pow(10, maxDecimals);
                num *= factor;
                den *= factor;
            }

            // 转换为整数
            num = Math.round(num);
            den = Math.round(den);

            // 计算最大公约数
            const gcdValue = this.gcd(num, den);
            
            // 约分
            const reducedNum = num / gcdValue;
            const reducedDen = den / gcdValue;

            // 构造约分后的分数（总是返回 LaTeX 格式）
            const reduced = `\\frac{${reducedNum}}{${reducedDen}}`;
            
            console.log('Reduced fraction:', reduced);

            return equals ? `${reduced}=${equals}` : reduced;
        } catch (error) {
            console.error('Reduction error:', error);
            throw error;
        }
    },

    /**
     * 質因數分解
     */
    primeFactorize(expression: string): string {
        try {
            // 移除等號及其後面的內容
            const [expr, equals] = expression.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            // 清理表達式,只保留數字
            const cleanExpr = expr.trim().replace(/[^\d]/g, '');
            const num = parseInt(cleanExpr);

            if (isNaN(num)) {
                throw new Error('無效的數字格式');
            }

            if (num <= 1) {
                throw new Error('請輸入大於1的整數');
            }

            // 執行質因數分解
            const factors = this._getPrimeFactors(num);
            
            // 格式化結果
            const result = this._formatPrimeFactors(factors);

            console.log('Prime factorization result:', result);

            // 添加等號部分(如果有)
            return equals ? `${result}=${equals}` : result;
        } catch (error) {
            console.error('Prime factorization error:', error);
            throw error;
        }
    },

    /**
     * 獲取質因數列表
     */
    _getPrimeFactors(n: number): number[] {
        const factors: number[] = [];
        let num = n;

        // 處理2的因數
        while (num % 2 === 0) {
            factors.push(2);
            num = num / 2;
        }

        // 處理其他質因數
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            while (num % i === 0) {
                factors.push(i);
                num = num / i;
            }
        }

        // 如果最後剩餘的數大於2,它本身就是質數
        if (num > 2) {
            factors.push(num);
        }

        return factors;
    },

    /**
     * 格式化質因數分解結果為 LaTeX 格式
     */
    _formatPrimeFactors(factors: number[]): string {
        if (factors.length === 0) return '';

        // 統計每個質因數的次數
        const countMap = new Map<number, number>();
        factors.forEach(factor => {
            countMap.set(factor, (countMap.get(factor) || 0) + 1);
        });

        // 按質因數大小排序
        const sortedFactors = Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);

        // 構建 LaTeX 格式的結果
        const terms = sortedFactors.map(([factor, count]) => {
            if (count === 1) return factor.toString();
            return `${factor}^{${count}}`;
        });

        return terms.join(' \\times ');
    },

    /**
     * 將指數表達式化簡為正指數形式
     * 處理規則：
     * 1. a^0 = 1
     * 2. a^{-n} = \frac{1}{a^n}
     * 3. a^m · a^n = a^{m+n}
     * 4. a^m ÷ a^n = a^{m-n}
     */
    simplifyIndices(latex: string): string {
        try {
            // 移除所有空格
            latex = latex.replace(/\s+/g, '');
            console.log('Input after removing spaces:', latex);
            
            // 如果表達式包含等號，分開處理
            const [expr, equals] = latex.split('=');
            if (!expr) {
                throw new Error('表達式為空');
            }
            console.log('Expression before processing:', expr);

            let result = expr;

            // 處理指數乘法：a^m · a^n = a^{m+n}
            const beforeMultiply = result;
            result = result.replace(/(\d+)\^{(\d+)}\\cdot\1\^{(\d+)}/g, (match, base, exp1, exp2) => {
                console.log('Multiply match found:', { match, base, exp1, exp2 });
                const sumExp = parseInt(exp1) + parseInt(exp2);
                return `${base}^{${sumExp}}`;
            });
            if (beforeMultiply !== result) {
                console.log('After handling multiplication:', result);
            }

            // 處理指數除法：a^m ÷ a^n = a^{m-n}
            const beforeDivide = result;
            result = result.replace(/(\d+)\^{(\d+)}\\div\1\^{(\d+)}/g, (match, base, exp1, exp2) => {
                console.log('Divide match found:', { match, base, exp1, exp2 });
                const diffExp = parseInt(exp1) - parseInt(exp2);
                if (diffExp === 0) return '1';
                if (diffExp < 0) {
                    return `\\frac{1}{${base}^{${-diffExp}}}`;
                }
                return `${base}^{${diffExp}}`;
            });
            if (beforeDivide !== result) {
                console.log('After handling division:', result);
            }

            // 處理負指數：a^{-n} = \frac{1}{a^n}
            const beforeNegative = result;
            result = result.replace(/(\d+)\^{-(\d+)}/g, (match, base, exp) => {
                console.log('Negative exponent match found:', { match, base, exp });
                return `\\frac{1}{${base}^{${exp}}}`;
            });
            if (beforeNegative !== result) {
                console.log('After handling negative exponent:', result);
            }

            // 處理零指數：a^0 = 1
            // 只在完全匹配 a^{0} 時才替換
            const beforeZero = result;
            if (result.match(/^\d+\^{0}$/)) {
                result = '1';
                console.log('After handling zero exponent:', result);
            }

            // 添加等號部分（如果有）
            const finalResult = equals ? `${result}=${equals}` : result;
            console.log('Final result:', finalResult);
            return finalResult;
        } catch (error) {
            console.error('Simplify indices error:', error);
            throw error;
        }
    },

    /**
     * 展開括號
     */
    expand(latex: string): string {
        try {
            // 移除等號及其後面的內容
            const [expr, equals] = latex.split('=');
            
            if (!expr) {
                throw new Error('表達式為空');
            }

            console.log('Expanding expression:', expr);

            // 清理表達式中的空格
            let expression = expr.trim();

            // 處理單項式乘以括號的情況：a(b+c) -> ab+ac
            const bracketPattern = /^([^()]+)\(([^()]+)\)$/;
            const match = expression.match(bracketPattern);

            if (match) {
                const [, outsideTerm, insideBracket] = match;
                console.log('Bracket expansion:', { outsideTerm, insideBracket });

                // 分割括號內的項
                const terms = insideBracket.split(/(?=[+-])/).filter(term => term);
                
                // 對每一項添加外部項
                const expandedTerms = terms.map(term => {
                    // 如果項以 + 開頭，移除它
                    term = term.replace(/^\+/, '');
                    return `${outsideTerm}(${term})`;
                });

                // 組合結果
                let result = expandedTerms.join('+');
                
                // 處理負號項
                result = result.replace(/\+\-/g, '-');
                
                // 移除開頭的加號
                result = result.replace(/^\+/, '');

                console.log('Expanded result:', result);

                // 添加等號部分（如果有）
                return equals ? `${result}=${equals}` : result;
            }

            // 如果不符合任何模式，返回原表達式
            return latex;
        } catch (error) {
            console.error('Expansion error:', error);
            throw error;
        }
    },

    // 新增輔助方法
    _hasOuterOperators(latex: string): boolean {
        let bracketCount = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex[i] === '(') bracketCount++;
            else if (latex[i] === ')') bracketCount--;
            else if (bracketCount === 0 && (latex[i] === '+' || latex[i] === '-' && i > 0)) {
                return true;
            }
        }
        return false;
    },

    _getOuterOperators(latex: string): string[] {
        const operators: string[] = [];
        let bracketCount = 0;
        for (let i = 0; i < latex.length; i++) {
            if (latex[i] === '(') bracketCount++;
            else if (latex[i] === ')') bracketCount--;
            else if (bracketCount === 0 && (latex[i] === '+' || latex[i] === '-' && i > 0)) {
                operators.push(latex[i]);
            }
        }
        return operators;
    }
};

// 類型定義
export type ExpressionType = 'constant' | 'numerical' | 'monomial' | 'polynomial';

export interface ExpressionInfo {
    type: ExpressionType;
    termCount: number;
    fractionInfo: FractionInfo;
    irrationalInfo: IrrationalInfo;
    variables: VariableInfo;
    likeTerms: LikeTermsInfo;
}

export interface FractionInfo {
    hasFraction: boolean;
    hasNestedFraction: boolean;
    fractionCount: number;
    nestedLevel: number;
}

export interface IrrationalInfo {
    hasIrrational: boolean;
    types: {
        hasSquareRoot: boolean;
        hasPi: boolean;
        hasE: boolean;
    };
    count: number;
}

export interface VariableInfo {
    hasVariables: boolean;
    count: number;
    list: string[];
}

export interface LikeTermsInfo {
    hasLikeTerms: boolean;
    groups: LikeTermGroup[];
}

export interface LikeTermGroup {
    variable: string;
    terms: string[];
    count: number;
}

/**
 * 數學運算操作定義
 */
export const MathOperations = {
    COMBINE_LIKE_TERMS: 'combine',
    SIMPLIFY: 'simplify',
    REDUCE_FRACTION: 'reduce',
    COMMON_DENOMINATOR: 'common-denominator',
    EXPAND: 'expand',
    FACTORIZE: 'factorize',
    DECIMAL_FRACTION_CONVERSION: 'decimal-fraction',
    PRIME_FACTORIZE: 'prime-factorize'
} as const;

export interface OperationButton {
    id: string;
    label: string;
    description: string;
    operation: keyof typeof MathOperations;
    isAvailable: (latex: string) => boolean;
}

/**
 * 運算按鈕配置
 */
export const OPERATION_BUTTONS: OperationButton[] = [
    {
        id: 'combine',
        label: '合併同類項',
        description: '合併表達式中的同類項',
        operation: 'COMBINE_LIKE_TERMS',
        isAvailable: (latex: string) => ExpressionAnalyzer.getExpressionType(latex) === 'polynomial'
    },
    {
        id: 'simplify',
        label: '化簡',
        description: '化簡表達式',
        operation: 'SIMPLIFY',
        isAvailable: () => true
    },
    {
        id: 'reduce',
        label: '約分',
        description: '約分分數',
        operation: 'REDUCE_FRACTION',
        isAvailable: (latex: string) => ExpressionAnalyzer.analyzeFraction(latex).hasFraction
    },
    {
        id: 'common-denominator',
        label: '通分',
        description: '將分數轉換為同分母',
        operation: 'COMMON_DENOMINATOR',
        isAvailable: (latex: string) => ExpressionAnalyzer.analyzeFraction(latex).hasFraction
    },
    {
        id: 'expand',
        label: '展開',
        description: '展開括號',
        operation: 'EXPAND',
        isAvailable: (latex: string) => latex.includes('(') || latex.includes('\\left(')
    },
    {
        id: 'factorize',
        label: '因式分解',
        description: '將表達式分解為因式',
        operation: 'FACTORIZE',
        isAvailable: (latex: string) => ExpressionAnalyzer.getExpressionType(latex) === 'polynomial'
    },
    {
        id: 'decimal-fraction',
        label: '小數分數轉換',
        description: '在小數和分數之間轉換',
        operation: 'DECIMAL_FRACTION_CONVERSION',
        isAvailable: (latex: string) => {
            return latex.includes('.') || latex.includes('\\frac');
        }
    },
    {
        id: 'prime-factorize',
        label: '質因數分解',
        description: '將數字分解為質因數的乘積',
        operation: 'PRIME_FACTORIZE',
        isAvailable: (latex: string) => {
            const num = parseInt(latex.replace(/[^\d]/g, ''));
            return !isNaN(num) && num > 1;
        }
    }
];

/**
 * 四捨五入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundTo(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * 向上舍入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundUp(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.ceil(num * factor) / factor;
}

/**
 * 向下舍入到指定小數位
 * @param num 要舍入的数字
 * @param decimals 小数位数
 */
export function roundDown(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
}

/**
 * 因子组合接口
 */
export interface FactorCombination {
    factors: number[];      // 所有因子的数组
}

/**
 * 获取一个数的所有质因数（包括重复的）
 * @param n 要分解的数
 * @returns 所有质因数数组
 */
function getAllPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let num = n;
    
    // 处理2的因数
    while (num % 2 === 0) {
        factors.push(2);
        num = num / 2;
    }
    
    // 处理其他质因数
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        while (num % i === 0) {
            factors.push(i);
            num = num / i;
        }
    }
    
    // 如果最后剩余的数大于2，它本身就是质数
    if (num > 2) {
        factors.push(num);
    }
    
    return factors;
}

export interface FactorCombinationOptions {
    minFactor?: number;      // 最小因子
    maxFactor?: number;      // 最大因子
    maxQuotient?: number;    // 最大商
    maxFactors?: number;     // 最多因子数量
}

export function generateFactorCombinations(
    number: number, 
    options: FactorCombinationOptions = {}
): FactorCombination[] {
    const {
        minFactor = 2,
        maxFactor = 9,
        maxQuotient = 9,
        maxFactors = 3
    } = options;

    // 获取所有质因数（包括重复的）
    const allPrimeFactors = getAllPrimeFactors(number);
    
    // 调整maxFactors为实际可能的最大因子数量
    const actualMaxFactors = Math.min(maxFactors, allPrimeFactors.length);

    const combinations: FactorCombination[] = [];
    
    // 递归函数来生成因子组合
    function generateCombinations(
        remainingNumber: number,
        currentFactors: number[],
        remainingFactors: number
    ) {
        // 如果已经达到目标因子数量
        if (remainingFactors === 1) {
            if (remainingNumber >= minFactor && remainingNumber <= maxFactor) {
                combinations.push({
                    factors: [...currentFactors, remainingNumber]
                });
            }
            return;
        }

        // 尝试不同的因子
        for (let f = minFactor; f <= Math.min(maxFactor, remainingNumber); f++) {
            if (remainingNumber % f === 0) {
                const nextNumber = remainingNumber / f;
                // 确保剩余的数不会超过maxQuotient
                if (nextNumber <= maxQuotient || remainingFactors === 2) {
                    generateCombinations(
                        nextNumber,
                        [...currentFactors, f],
                        remainingFactors - 1
                    );
                }
            }
        }
    }

    // 从2个因子开始尝试到actualMaxFactors个因子
    for (let numFactors = 2; numFactors <= actualMaxFactors; numFactors++) {
        generateCombinations(number, [], numFactors);
    }

    return combinations;
} 