interface ArithmeticOperation {
    type: 'addition';
    operands: number[];
    difficulty: number;
}

interface DifficultyInfo {
    level: number;
    name: string;
    description: string;
}

export class AdditionGenerator {
    private difficulty: number;
    private static readonly difficultyInfos: DifficultyInfo[] = [
        {
            level: 1,
            name: "基礎",
            description: "個位數加法 (1-9)"
        },
        {
            level: 2,
            name: "初級",
            description: "雙位數加法 (10-99)"
        },
        {
            level: 3,
            name: "中級",
            description: "三位數加法 (100-999)"
        },
        {
            level: 4,
            name: "進階",
            description: "帶小數加法"
        },
        {
            level: 5,
            name: "挑戰",
            description: "混合計算（三個數相加）"
        }
    ];

    constructor(difficulty: number) {
        this.difficulty = difficulty;
    }

    static getDifficultyInfos(): DifficultyInfo[] {
        return this.difficultyInfos;
    }

    generate(): ArithmeticOperation {
        const numbers = this.generateNumbers();
        return {
            type: 'addition',
            operands: numbers,
            difficulty: this.difficulty
        };
    }

    private generateNumbers(): number[] {
        switch (this.difficulty) {
            case 1: // 個位數加法 (1-9)
                return [
                    Math.floor(Math.random() * 9) + 1,
                    Math.floor(Math.random() * 9) + 1
                ];
            
            case 2: // 雙位數加法 (10-99)
                return [
                    Math.floor(Math.random() * 90) + 10,
                    Math.floor(Math.random() * 90) + 10
                ];
            
            case 3: // 三位數加法 (100-999)
                return [
                    Math.floor(Math.random() * 900) + 100,
                    Math.floor(Math.random() * 900) + 100
                ];
            
            case 4: // 帶小數加法
                return [
                    Number((Math.random() * 100).toFixed(1)),
                    Number((Math.random() * 100).toFixed(1))
                ];
            
            case 5: // 混合計算（三個數相加）
                return [
                    Math.floor(Math.random() * 100),
                    Math.floor(Math.random() * 100),
                    Math.floor(Math.random() * 100)
                ];
            
            default:
                return [1, 1];
        }
    }
} 