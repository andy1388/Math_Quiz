interface ArithmeticOperation {
    type: 'addition' | 'subtraction' | 'multiplication' | 'division';
    operands: number[];
    difficulty: number;
}

interface CalculationStep {
    description: string;
    operation: string;
    result: number;
    explanation?: string;
}

export class AdditionGenerator {
    private difficulty: number;

    constructor(difficulty: number) {
        this.difficulty = difficulty;
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

    solve(operation: ArithmeticOperation): CalculationStep[] {
        const steps: CalculationStep[] = [];
        const sum = operation.operands.reduce((a: number, b: number): number => a + b, 0);

        // 基本步驟
        steps.push({
            description: '直接相加',
            operation: operation.operands.join(' + '),
            result: sum
        });

        // 根據難度添加詳細步驟
        if (this.difficulty >= 2) {
            steps.unshift({
                description: '對齊個位數',
                operation: this.formatAlignedNumbers(operation.operands),
                result: sum
            });
        }

        if (this.difficulty >= 3) {
            steps.splice(1, 0, {
                description: '由右至左逐位相加',
                operation: this.formatCarryOver(operation.operands),
                result: sum
            });
        }

        return steps;
    }

    private formatAlignedNumbers(numbers: number[]): string {
        const maxLength = Math.max(...numbers.map(n => n.toString().length));
        return numbers.map(n => n.toString().padStart(maxLength)).join('\n+');
    }

    private formatCarryOver(numbers: number[]): string {
        // 實現進位標記的格式化
        // 這裡需要更詳細的實現...
        return '待實現';
    }
} 