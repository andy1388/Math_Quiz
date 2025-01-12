import express from 'express';
import MathSolver from '../solvers/MathSolver';

const router = express.Router();

router.post('/solve', async (req, res) => {
    try {
        const { question, type } = req.body;
        
        let solver;
        switch(type) {
            case 'math':
                solver = new MathSolver();
                break;
            default:
                throw new Error('未支援的解題類型');
        }
        
        solver.setQuestion(question);
        const solution = await solver.solve();
        
        res.json({
            success: true,
            solution
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 