import express from 'express';
import { GeneratorScanner } from '../utils/generatorScanner';
import { DirectoryStructure } from '../types/GeneratorTypes';
import { QuestionGeneratorFactory } from '../generators/QuestionGeneratorFactory';
import { MC_Maker } from '../generators/MC_Maker';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const scanner = new GeneratorScanner();
let generatorCache: DirectoryStructure | null = null;

// 获取可用生成器列表
router.get('/available-generators', async (req, res) => {
    try {
        // 直接使用 scanBasicStructure 返回的结构
        const structure = await scanner.scanBasicStructure();
        res.json(structure);
    } catch (error) {
        console.error('获取生成器列表失败:', error);
        res.status(500).json({ error: '获取生成器列表失败' });
    }
});

// 生成题目
router.get('/generate/:generatorId', async (req: Request, res: Response) => {
    try {
        const generatorId = req.params.generatorId;
        const difficulty = parseInt(req.query.difficulty as string) || 1;
        
        const generator = QuestionGeneratorFactory.createGenerator(generatorId, difficulty);
        if (!generator) {
            return res.status(404).json({ error: '找不到指定的题目生成器' });
        }

        const output = generator.generate();
        const question = MC_Maker.createQuestion(output, difficulty);
        
        res.json(question);
    } catch (error) {
        console.error('生成题目时出错:', error);
        res.status(500).json({ error: '生成题目时出错' });
    }
});

// 获取文件夹内容
router.get('/folder-content/:path(*)', async (req, res) => {
    try {
        const folderPath = req.params.path;
        const generators = await scanner.scanFolderGenerators(folderPath);
        res.json({ generators });
    } catch (error) {
        console.error('Error loading folder content:', error);
        res.status(500).json({ error: 'Failed to load folder content' });
    }
});

export default router; 