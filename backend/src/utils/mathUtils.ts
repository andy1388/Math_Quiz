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
            variables: this.findVariables(latex)
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
        const variables = new Set(latex.match(/[a-zA-Z]/g) || []);
        return {
            hasVariables: variables.size > 0,
            count: variables.size,
            list: Array.from(variables)
        };
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

/**
 * 數學運算操作定義
 */
export const MathOperations = {
    COMBINE_LIKE_TERMS: 'combine',
    SIMPLIFY: 'simplify',
    REDUCE_FRACTION: 'reduce',
    COMMON_DENOMINATOR: 'common-denominator',
    EXPAND: 'expand',
    FACTORIZE: 'factorize'
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
    }
]; 