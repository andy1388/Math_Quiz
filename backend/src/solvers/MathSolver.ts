import SolverBase from './SolverBase';

class MathSolver extends SolverBase {
    async solve(): Promise<string[]> {
        // 這裡實現數學解題邏輯
        this.solution = ['步驟1', '步驟2', '答案'];
        return this.solution;
    }
}

export default MathSolver; 