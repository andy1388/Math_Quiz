abstract class SolverBase {
    protected question: string;
    protected solution: string[];
    
    constructor() {
        this.question = '';
        this.solution = [];
    }

    abstract solve(): Promise<string[]>;
    
    setQuestion(question: string): void {
        this.question = question;
    }

    getSolution(): string[] {
        return this.solution;
    }
}

export default SolverBase; 