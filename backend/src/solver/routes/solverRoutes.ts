import express from 'express';
import { AdditionGenerator } from '../arithmetic/Addition';
import { FractionReductionGenerator } from '../arithmetic/FractionReduction';
import { DecimalFractionConversionGenerator } from '../arithmetic/DecimalFractionConversion';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { type, difficulty } = req.body;

        switch (type) {
            case 'addition':
                const additionGenerator = new AdditionGenerator(difficulty);
                const additionOperation = additionGenerator.generate();
                const additionQuestion = additionOperation.operands.join(' + ') + ' = ?';
                res.json({
                    question: formatToLatex(additionQuestion),
                    operation: additionOperation
                });
                break;

            case 'fraction-reduction':
                const fractionGenerator = new FractionReductionGenerator(difficulty);
                const fractionOperation = fractionGenerator.generate();
                const fractionQuestion = `\\frac{${fractionOperation.numerator}}{${fractionOperation.denominator}}`;
                res.json({
                    question: fractionQuestion,
                    operation: fractionOperation
                });
                break;

            case 'decimal-fraction-conversion':
                const conversionGenerator = new DecimalFractionConversionGenerator(difficulty);
                const conversionOperation = conversionGenerator.generate();
                const conversionQuestion = `${conversionOperation.value} = ?`;
                res.json({
                    question: conversionQuestion,
                    operation: conversionOperation
                });
                break;

            default:
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
        
        switch (type) {
            case 'addition':
                res.json(AdditionGenerator.getDifficultyInfos());
                break;
            case 'fraction-reduction':
                res.json(FractionReductionGenerator.getDifficultyInfos());
                break;
            case 'decimal-fraction-conversion':
                res.json(DecimalFractionConversionGenerator.getDifficultyInfos());
                break;
            default:
                res.status(400).json({ error: '不支援的運算類型' });
        }
    } catch (error) {
        console.error('Get Difficulties Error:', error);
        res.status(500).json({ error: '獲取難度信息失敗' });
    }
});

function formatToLatex(expression: string): string {
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