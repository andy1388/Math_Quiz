import express from 'express';
import { AdditionGenerator } from '../arithmetic/Addition';

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

router.get('/difficulties/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        if (type === 'addition') {
            const difficulties = AdditionGenerator.getDifficultyInfos();
            res.json(difficulties);
        } else {
            res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Get Difficulties Error:', error);
        res.status(500).json({ error: '獲取難度信息失敗' });
    }
});

export default router; 