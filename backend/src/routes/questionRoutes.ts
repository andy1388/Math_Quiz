import express from 'express';
import fs from 'fs';
import path from 'path';
import { IQuestion } from '../generators/MC_Maker';
import { MC_Maker } from '../generators/MC_Maker';
import { GeneratorClass, GeneratorMap } from '../generators/QuestionGenerator';

const router = express.Router();

// 動態導入生成器
async function loadGenerator(topic: string): Promise<GeneratorClass | null> {
    try {
        const { generators } = await import('../generators') as { generators: GeneratorMap };
        return generators[topic] || null;
    } catch (error) {
        console.error('加載生成器失敗:', error);
        return null;
    }
}

router.get('/generate/:topic', async (req, res) => {
    const { topic } = req.params;
    const difficulty = parseInt(req.query.difficulty as string) || 1;

    try {
        const GeneratorClass = await loadGenerator(topic);
        if (!GeneratorClass) {
            return res.status(404).json({ 
                error: '題目類型不存在',
                userMessage: '此題目類型暫時不可用'
            });
        }

        const generator = new GeneratorClass(difficulty);
        const output = generator.generate();
        const question = MC_Maker.createQuestion(output, difficulty);
        
        res.json(question);
    } catch (error: any) {
        console.error('生成題目錯誤:', error);
        
        // 檢查 error 是否為 Error 實例
        const errorMessage = error instanceof Error ? error.message : '未知錯誤';
        
        // 根據錯誤類型返回適當的消息
        if (errorMessage.includes('正在開發中')) {
            res.status(400).json({
                error: errorMessage,
                userMessage: '此難度等級正在開發中，請稍後再試或選擇其他難度'
            });
        } else if (errorMessage.includes('不可用')) {
            res.status(400).json({
                error: errorMessage,
                userMessage: '此難度等級暫時不可用，請選擇其他難度'
            });
        } else {
            res.status(500).json({
                error: '生成題目時發生錯誤',
                userMessage: '系統發生錯誤，請稍後再試'
            });
        }
    }
});

router.get('/available-generators', (req, res) => {
    try {
        const generatorsPath = path.join(__dirname, '../generators');
        console.log('掃描目錄:', generatorsPath);
        
        const structure = getDirectoryStructure(generatorsPath);
        console.log('目錄結構:', JSON.stringify(structure, null, 2));
        
        res.json(structure);
    } catch (error) {
        console.error('獲取生成器列表失敗:', error);
        res.status(500).json({ error: '無法獲取生成器列表' });
    }
});

interface DirectoryStructure {
    name: string;
    type: 'directory' | 'generator';
    children?: DirectoryStructure[];
    topic?: string;
}

function getDirectoryStructure(basePath: string) {
    return [
        {
            name: 'F1',
            type: 'directory',
            children: [
                {
                    name: 'L12 Polynomials',
                    type: 'directory',
                    children: [
                        {
                            name: '12.1 Law of Indices',
                            type: 'directory',
                            children: [
                                {
                                    name: 'Q1: 指數運算',
                                    type: 'generator',
                                    topic: 'F1L12.1_1'
                                },
                                {
                                    name: 'Q2: 指數填空',
                                    type: 'generator',
                                    topic: 'F1L12.1_2'
                                },
                                {
                                    name: 'Q3: 指數除法',
                                    type: 'generator',
                                    topic: 'F1L12.1_3'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
}

export default router; 