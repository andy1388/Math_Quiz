interface ConversionOperation {
    type: 'decimal-fraction-conversion';
    value: number;
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class DecimalFractionConversionGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "一位小數轉分數"
        },
        {
            level: 2,
            name: "初級",
            description: "二位小數轉分數"
        },
        {
            level: 3,
            name: "進階",
            description: "循環小數轉分數"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): ConversionOperation {
        return {
            type: 'decimal-fraction-conversion',
            value: this.generateDecimal(),
            difficulty: this.difficulty
        };
    }

    private generateDecimal(): number {
        switch (this.difficulty) {
            case 1:
                return Number((Math.random()).toFixed(1));
            case 2:
                return Number((Math.random()).toFixed(2));
            case 3:
                // 生成循环小数
                const base = Math.floor(Math.random() * 9) + 1;
                return Number(`0.${base}${base}${base}`);
            default:
                return 0.5;
        }
    }
} 