import express from 'express';
import { GeneratorScanner } from '../utils/generatorScanner';
import { DirectoryStructure } from '../types/GeneratorTypes';
import { MC_Maker } from '../generators/MC_Maker';
import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

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
router.get('/generate/:generatorId', async (req, res) => {
    try {
        const { generatorId } = req.params;
        const difficulty = parseInt(req.query.difficulty as string) || 1;
        
        console.log('Generating question for:', generatorId, 'difficulty:', difficulty);
        
        // 構建生成器路徑
        const generatorPath = path.join(
            __dirname,
            '../generators',
            'F1',
            'F1_L3_Linear_Equations',
            'F1L3.1_Equation_without_Fraction',
            `${generatorId}.ts`
        );
        
        // 檢查文件是否存在
        if (!fs.existsSync(generatorPath)) {
            throw new Error(`Generator not found: ${generatorId}`);
        }
        
        // 動態導入生成器
        const Generator = (await import(generatorPath)).default;
        
        const generator = new Generator(difficulty);
        const question = generator.generate();
        
        res.json(question);
    } catch (error: any) {
        console.error('Error generating question:', error);
        res.status(500).json({ 
            error: 'Failed to generate question',
            details: error?.message || 'Unknown error'
        });
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

// 添加新的接口來獲取生成器的難度等級
router.get('/generator-info/:generatorId', async (req, res) => {
    try {
        const { generatorId } = req.params;
        
        // 構建 .desc.txt 文件路徑
        const descPath = path.join(
            __dirname,
            '../generators/F1/F1_L3_Linear_Equations/F1L3.1_Equation_without_Fraction',
            `${generatorId}.desc.txt`
        );
        
        // 檢查文件是否存在
        if (!fs.existsSync(descPath)) {
            throw new Error(`Description file not found: ${generatorId}`);
        }
        
        // 讀取文件內容
        const content = await fsPromises.readFile(descPath, 'utf-8');
        
        // 解析 Level number
        const levelMatch = content.match(/Level number：(\d+)/);
        const levelNumber = levelMatch ? parseInt(levelMatch[1]) : 5;
        
        res.json({ levelNumber });
    } catch (error) {
        console.error('Error getting generator info:', error);
        res.status(500).json({ error: 'Failed to get generator info' });
    }
});

export default router; 