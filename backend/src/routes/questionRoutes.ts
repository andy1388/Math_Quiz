import express from 'express';
import fs from 'fs';
import path from 'path';
import { IQuestion } from '../generators/QuestionGenerator';

const router = express.Router();

// 動態導入生成器
async function loadGenerator(topic: string): Promise<any | null> {
    try {
        const generatorPath = constructGeneratorPath(topic);
        if (!generatorPath) return null;

        const module = await import(generatorPath);
        return Object.values(module)[0] || null;
    } catch (error) {
        console.error('加載生成器失敗:', error);
        return null;
    }
}

function constructGeneratorPath(topic: string): string | null {
    const generatorsPath = path.join(__dirname, '../generators');
    
    // 遞歸搜索目錄找到對應的生成器文件
    const generatorFile = findGeneratorFile(generatorsPath, topic);
    return generatorFile;
}

function findGeneratorFile(baseDir: string, topic: string): string | null {
    const files = fs.readdirSync(baseDir);
    
    for (const file of files) {
        const fullPath = path.join(baseDir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            const found = findGeneratorFile(fullPath, topic);
            if (found) return found;
        } else if (file.endsWith('Generator_Q1.ts')) {
            // 從文件名中提取章節ID
            const match = file.match(/^(F\dL\d+(?:\.\d+)*)/);
            if (match && match[1] === topic) {
                return fullPath;
            }
        }
    }
    
    return null;
}

router.get('/generate/:topic', async (req, res) => {
    const { topic } = req.params;
    const difficulty = parseInt(req.query.difficulty as string) || 1;

    try {
        const GeneratorClass = await loadGenerator(topic);
        if (!GeneratorClass) {
            return res.status(404).json({ error: '題目類型不存在' });
        }

        const generator = new GeneratorClass(difficulty);
        const question: IQuestion = generator.generate();
        res.json(question);
    } catch (error) {
        console.error('生成題目錯誤:', error);
        res.status(500).json({ error: '生成題目時發生錯誤' });
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

function getDirectoryStructure(dir: string): DirectoryStructure[] {
    try {
        const items = fs.readdirSync(dir);
        const structure: DirectoryStructure[] = [];

        // 添加排序函數
        function sortByLessonNumber(a: string, b: string): number {
            // 提取課程編號
            const getNumber = (str: string) => {
                const match = str.match(/L(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            
            const numA = getNumber(a);
            const numB = getNumber(b);
            
            return numA - numB;
        }

        // 排序目錄項目
        items.sort(sortByLessonNumber).forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const children = getDirectoryStructure(fullPath);
                structure.push({
                    name: item,
                    type: 'directory',
                    children: children
                });
            } else if (item.endsWith('Generator_Q1.ts')) {
                const match = item.match(/^(F\dL\d+(?:\.\d+)*)/);
                if (match) {
                    structure.push({
                        name: item,
                        type: 'generator',
                        topic: match[1]
                    });
                }
            }
        });

        return structure;
    } catch (error) {
        console.error('讀取目錄失敗:', dir, error);
        return [];
    }
}

export default router; 