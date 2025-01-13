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
     * 獲取表達式類型
     */
    getExpressionType(latex: string): ExpressionType {
        const cleanLatex = this._cleanLatex(latex);
        const hasVariable = /[a-zA-Z]/.test(cleanLatex);
        const hasMultipleTerms = /[+\-]/.test(cleanLatex);

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
        // 如果是常數或單項式，返回1
        if (!this._hasMultipleTerms(cleanLatex)) return 1;
        // 計算運算符數量並加1
        const operators = cleanLatex.match(/[+\-]/g) || [];
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
    _cleanLatex(latex: string): string {
        return latex.replace(/\s+/g, '');
    },

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
     * 合併同類項
     */
    combineTerms(latex: string): string {
        // 移除等号及其后面的内容
        const [expression, equals] = latex.split('=');
        const terms = this._splitTerms(expression);
        const groups = new Map<string, number>();

        // 分组并合并系数
        terms.forEach(term => {
            const { coefficient, variable } = this._parseTermParts(term);
            const key = variable || 'numeric'; // 使用 'numeric' 标识纯数字项
            // 使用 parseFloat 而不是 parseInt 来处理小数
            const coef = parseFloat(coefficient) || 1;
            groups.set(key, (groups.get(key) || 0) + coef);
        });

        // 构建结果
        let result = Array.from(groups.entries())
            .filter(([_, coef]) => coef !== 0)  // 移除系数为0的项
            .map(([variable, coefficient]) => {
                // 格式化系数，最多保留5位小数
                const formattedCoef = this._formatCoefficient(coefficient);
                
                if (variable === 'numeric') {
                    return coefficient > 0 ? `+${formattedCoef}` : formattedCoef;
                }
                if (coefficient === 1) return `+${variable}`;
                if (coefficient === -1) return `-${variable}`;
                return coefficient > 0 ? `+${formattedCoef}${variable}` : `${formattedCoef}${variable}`;
            })
            .join('');

        // 处理结果的格式
        result = result.replace(/^\+/, '');  // 移除开头的加号
        
        // 添加等号部分（如果有）
        return equals ? `${result}=${equals}` : result;
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
    DECIMAL_FRACTION_CONVERSION: 'decimal-fraction'
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
    }
]; 