import { QuestionGenerator, IQuestion } from '../QuestionGenerator';

interface IMultipleChoiceQuestion extends IQuestion {
    correctIndex: number;
}

export class ArithmeticMCQGenerator extends QuestionGenerator {
    private operations = ['+', '-', '*', '/'];
    
    constructor(difficulty: number = 1) {
        super(difficulty, 'F1L0.1.1');
    }

    generate(): IMultipleChoiceQuestion {
        const numbers = this.generateNumbers();
        const operation = this.selectOperation();
        const correctAnswer = this.calculateAnswer(numbers, operation);
        const options = this.generateOptions(correctAnswer);
        const correctIndex = options.indexOf(correctAnswer.toString());

        return {
            id: this.generateId(),
            type: 'multiple_choice',
            difficulty: this.difficulty,
            content: this.constructQuestion(numbers, operation),
            options: options,
            correctIndex: correctIndex,
            answer: correctAnswer.toString(),
            explanation: this.generateExplanation(numbers, operation, correctAnswer)
        };
    }

    private generateNumbers(): number[] {
        const count = Math.min(this.difficulty + 1, 4);
        const numbers: number[] = [];
        
        for (let i = 0; i < count; i++) {
            let max = Math.pow(10, this.difficulty);
            let min = Math.max(1, -max);
            if (this.difficulty <= 2) min = 1;
            
            numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        return numbers;
    }

    private selectOperation(): string {
        if (this.difficulty <= 2) {
            return this.operations[Math.floor(Math.random() * 2)];
        } else if (this.difficulty <= 4) {
            return this.operations[Math.floor(Math.random() * 3)];
        }
        return this.operations[Math.floor(Math.random() * 4)];
    }

    private calculateAnswer(numbers: number[], operation: string): number {
        let result = numbers[0];
        for (let i = 1; i < numbers.length; i++) {
            switch(operation) {
                case '+': result += numbers[i]; break;
                case '-': result -= numbers[i]; break;
                case '*': result *= numbers[i]; break;
                case '/': result /= numbers[i]; break;
            }
        }
        return Number(result.toFixed(2));
    }

    private generateOptions(correctAnswer: number): string[] {
        const options: string[] = [correctAnswer.toString()];
        
        while (options.length < 4) {
            let wrongAnswer: number;
            const strategy = Math.floor(Math.random() * 3);
            
            switch(strategy) {
                case 0:
                    wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1);
                    break;
                case 1:
                    wrongAnswer = correctAnswer * (Math.random() < 0.5 ? 1.1 : 0.9);
                    break;
                default:
                    wrongAnswer = -correctAnswer;
            }
            
            wrongAnswer = Number(wrongAnswer.toFixed(2));
            if (!options.includes(wrongAnswer.toString())) {
                options.push(wrongAnswer.toString());
            }
        }
        
        return options.sort(() => Math.random() - 0.5);
    }

    private constructQuestion(numbers: number[], operation: string): string {
        const opSymbol = {
            '+': '＋',
            '-': '－',
            '*': '×',
            '/': '÷'
        }[operation];
        
        return `計算：${numbers.join(` ${opSymbol} `)} = ?`;
    }

    private generateExplanation(numbers: number[], operation: string, answer: number): string {
        const steps = ['解題步驟：'];
        let currentResult = numbers[0];
        
        for (let i = 1; i < numbers.length; i++) {
            const prevResult = currentResult;
            switch(operation) {
                case '+':
                    currentResult += numbers[i];
                    steps.push(`${prevResult} + ${numbers[i]} = ${currentResult}`);
                    break;
                case '-':
                    currentResult -= numbers[i];
                    steps.push(`${prevResult} - ${numbers[i]} = ${currentResult}`);
                    break;
                case '*':
                    currentResult *= numbers[i];
                    steps.push(`${prevResult} × ${numbers[i]} = ${currentResult}`);
                    break;
                case '/':
                    currentResult /= numbers[i];
                    steps.push(`${prevResult} ÷ ${numbers[i]} = ${currentResult}`);
                    break;
            }
        }
        
        steps.push(`\n正確答案：${answer}`);
        return steps.join('\n');
    }
} 