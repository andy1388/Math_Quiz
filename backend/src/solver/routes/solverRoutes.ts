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
                question: formatToLatex(question),
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

// 辅助函数：将普通数学表达式转换为 LaTeX 格式
function formatToLatex(expression: string): string {
    // 替换基本运算符
    return expression
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\*/g, ' \\times ')
        .replace(/\//g, ' \\div ')
        .replace(/(\d+)\s*\^\s*(\d+)/g, '$1^{$2}')
        .replace(/\=/g, ' = ')
        .trim();
}

export default router; 