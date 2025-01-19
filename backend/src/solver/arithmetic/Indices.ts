interface IndicesOperation {
    type: 'indices';
    base: number;
    exponent: number;
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class IndicesGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "正整數指數 (2-5的1-3次方)"
        },
        {
            level: 2,
            name: "初級",
            description: "零指數和負整數指數"
        },
        {
            level: 3,
            name: "中級",
            description: "分數指數"
        },
        {
            level: 4,
            name: "進階",
            description: "代數指數運算"
        },
        {
            level: 5,
            name: "挑戰",
            description: "複合指數運算"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): IndicesOperation {
        const { base, exponent } = this.generateNumbers();
        return {
            type: 'indices',
            base,
            exponent,
            difficulty: this.difficulty
        };
    }

    private generateNumbers(): { base: number; exponent: number } {
        switch (this.difficulty) {
            case 1: // 基礎：正整數指數
                return {
                    base: Math.floor(Math.random() * 4) + 2, // 2-5
                    exponent: Math.floor(Math.random() * 3) + 1 // 1-3
                };
            
            case 2: // 初級：零指數和負整數指數
                return {
                    base: Math.floor(Math.random() * 4) + 2, // 2-5
                    exponent: Math.floor(Math.random() * 5) - 3 // -3到1
                };
            
            case 3: // 中級：分數指數
                const denominators = [2, 3, 4];
                return {
                    base: Math.floor(Math.random() * 4) + 2, // 2-5
                    exponent: 1 / denominators[Math.floor(Math.random() * denominators.length)]
                };
            
            case 4: // 進階：代數指數運算
                return {
                    base: Math.floor(Math.random() * 4) + 2,
                    exponent: Math.floor(Math.random() * 3) + 2
                };
            
            case 5: // 挑戰：複合指數運算
                return {
                    base: Math.floor(Math.random() * 4) + 2,
                    exponent: Math.floor(Math.random() * 4) - 2
                };
            
            default:
                return { base: 2, exponent: 1 };
        }
    }

    getLatexQuestion(operation: IndicesOperation): string {
        const { base, exponent, difficulty } = operation;
        
        switch (difficulty) {
            case 1:
            case 2:
                return `${base}^{${exponent}} = ?`;
            
            case 3:
                // 处理分数指数
                const fraction = this.formatFraction(exponent);
                return `${base}^{${fraction}} = ?`;
            
            case 4:
                // 代数指数运算
                return `(${base}^{x})^{${exponent}} = ?`;
            
            case 5:
                // 复合指数运算
                const op = Math.random() > 0.5 ? '+' : '-';
                const secondExponent = Math.floor(Math.random() * 3) + 1;
                return `${base}^{${exponent}} ${op} ${base}^{${secondExponent}} = ?`;
            
            default:
                return `${base}^{${exponent}} = ?`;
        }
    }

    private formatFraction(decimal: number): string {
        if (decimal === 1/2) return '\\frac{1}{2}';
        if (decimal === 1/3) return '\\frac{1}{3}';
        if (decimal === 1/4) return '\\frac{1}{4}';
        return decimal.toString();
    }
} 