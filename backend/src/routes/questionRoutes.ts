import express from 'express';
import fs from 'fs';
import path from 'path';
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

router.get('/available-generators', (req, res) => {
    try {
        const generatorsPath = path.join(__dirname, '../generators');
        const availableGenerators = findGenerators(generatorsPath);
        res.json(availableGenerators);
    } catch (error) {
        res.status(500).json({ error: '無法獲取生成器列表' });
    }
});

function findGenerators(dir: string): string[] {
    const generators: string[] = [];
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            generators.push(...findGenerators(fullPath));
        } else if (file.endsWith('Generator.ts')) {
            const match = fullPath.match(/F1L\d+(\.\d+)*(?=\/[^/]+Generator\.ts)/);
            if (match) {
                generators.push(match[0]);
            }
        }
    });
    
    return generators;
}

export default router; 