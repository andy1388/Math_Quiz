import express from 'express';
import { AdditionGenerator } from '../arithmetic/Addition';

interface ArithmeticOperation {
    type: 'addition' | 'subtraction' | 'multiplication' | 'division';
    operands: number[];
    difficulty: number;
}

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { type, difficulty } = req.body;

        if (type === 'addition') {
            const generator = new AdditionGenerator(difficulty);
            const operation = generator.generate();
            const question = operation.operands.join(' + ') + ' = ?';

            res.json({
                question,
                operation
            });
        } else {
            res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Generate Error:', error);
        res.status(500).json({ error: '生成失敗' });
    }
});

router.post('/solve', async (req, res) => {
    try {
        const { equation, type, difficulty } = req.body;

        if (type === 'addition') {
            const generator = new AdditionGenerator(difficulty);
            const cleanEquation = equation.replace('= ?', '').trim();
            const numbers: number[] = cleanEquation.split('+').map((n: string): number => {
                const trimmed = n.trim();
                const parsed = parseFloat(trimmed);
                if (isNaN(parsed)) {
                    throw new Error('無效的數字格式');
                }
                return parsed;
            });

            const operation: ArithmeticOperation = {
                type: 'addition' as const,
                operands: numbers,
                difficulty
            };
            const steps = generator.solve(operation);

            res.json({ steps });
        } else {
            res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Solve Error:', error);
        res.status(500).json({ error: '求解失敗' });
    }
});

export default router; 