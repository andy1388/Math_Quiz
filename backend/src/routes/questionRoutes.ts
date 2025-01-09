import express from 'express';
import { ArithmeticMCQGenerator } from '../generators/F1L0/MultipleChoiceGenerator';

const router = express.Router();

router.get('/generate/:topic', (req, res) => {
    const { topic } = req.params;
    const difficulty = parseInt(req.query.difficulty as string) || 1;

    try {
        let generator;
        switch(topic) {
            case 'F1L0.1.1':
                generator = new ArithmeticMCQGenerator(difficulty);
                break;
            default:
                return res.status(404).json({ error: '題目類型不存在' });
        }

        const question = generator.generate();
        res.json(question);
    } catch (error) {
        console.error('生成題目錯誤:', error);
        res.status(500).json({ error: '生成題目時發生錯誤' });
    }
});

export default router; 