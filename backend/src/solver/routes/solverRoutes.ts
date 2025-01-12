import express from 'express';
import { AdditionGenerator } from '../arithmetic/Addition';

const router = express.Router();

router.post('/api/generate', async (req, res) => {
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

router.post('/api/solve', async (req, res) => {
    try {
        const { equation, type, difficulty } = req.body;

        if (type === 'addition') {
            const generator = new AdditionGenerator(difficulty);
            const numbers = equation.split('+').map(n => parseFloat(n.trim()));
            const operation = {
                type: 'addition',
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