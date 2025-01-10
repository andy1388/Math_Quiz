import express from 'express';
import { GeneratorScanner } from '../utils/generatorScanner';
import { 
    GeneratorInfo, 
    GeneratorStructure, 
    SectionStructure, 
    ChapterStructure, 
    DirectoryStructure 
} from '../types/GeneratorTypes';

const router = express.Router();
const scanner = new GeneratorScanner();
let generatorCache: Map<string, any> = new Map();

// 初始化时扫描所有生成器
async function initializeGenerators() {
    console.log('开始初始化生成器缓存...');
    try {
        generatorCache = await scanner.scanGenerators();
        console.log('生成器缓存初始化完成，缓存大小:', generatorCache.size);
        console.log('缓存的生成器:', Array.from(generatorCache.keys()));
    } catch (error) {
        console.error('初始化生成器缓存失败:', error);
        throw error;
    }
}

// 获取可用生成器列表
router.get('/available-generators', async (req, res) => {
    try {
        const generators = Array.from(generatorCache.values());
        console.log('扫描到的生成器列表:', JSON.stringify(generators, null, 2));
        
        if (generators.length === 0) {
            console.warn('没有找到任何生成器');
        }
        
        const structure = organizeGenerators(generators);
        console.log('组织后的目录结构:', JSON.stringify(structure, null, 2));
        
        if (Object.keys(structure).length === 0) {
            console.warn('生成的目录结构为空');
        }
        
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
        const { difficulty = 1 } = req.query;
        
        const generatorInfo = generatorCache.get(generatorId);
        if (!generatorInfo) {
            return res.status(404).json({ error: '生成器不存在' });
        }

        // 动态导入生成器
        const GeneratorClass = (await import(generatorInfo.path)).default;
        const generator = new GeneratorClass(Number(difficulty));
        const question = generator.generate();
        
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: '生成题目失败' });
    }
});

// 组织生成器结构
function organizeGenerators(generators: GeneratorInfo[]): DirectoryStructure {
    const structure: DirectoryStructure = {};
    
    generators.forEach(gen => {
        const chapterId = gen.chapter.id;
        const sectionId = gen.section.id;
        
        // 如果章节不存在，创建它
        if (!structure[chapterId]) {
            structure[chapterId] = {
                title: gen.chapter.title,
                sections: {}
            };
        }
        
        // 如果小节不存在，创建它
        if (!structure[chapterId].sections[sectionId]) {
            structure[chapterId].sections[sectionId] = {
                title: gen.section.title,
                generators: []
            };
        }
        
        // 添加生成器信息
        structure[chapterId].sections[sectionId].generators.push({
            id: gen.id,
            title: gen.title,
            difficulty: gen.difficulty
        });
    });
    
    return structure;
}

// 启动时初始化
initializeGenerators().catch(console.error);

export default router; 