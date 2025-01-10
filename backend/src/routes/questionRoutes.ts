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
    try {
        generatorCache = await scanner.scanGenerators();
    } catch (error) {
        console.error('初始化生成器缓存失败:', error);
        throw error;
    }
}

// 获取可用生成器列表
router.get('/available-generators', async (req, res) => {
    try {
        const generators = Array.from(generatorCache.values());
        const structure = organizeGenerators(generators);
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
        
        console.log('Attempting to generate question:', { generatorId, difficulty });
        
        const generatorInfo = generatorCache.get(generatorId);
        if (!generatorInfo) {
            console.error('Generator not found:', generatorId);
            return res.status(404).json({ error: '生成器不存在' });
        }

        try {
            console.log('Generator path:', generatorInfo.path);
            const GeneratorClass = (await import(generatorInfo.path)).default;
            console.log('Generator class loaded:', !!GeneratorClass);
            
            const generator = new GeneratorClass(Number(difficulty));
            console.log('Generator instance created');
            
            const question = generator.generate();
            console.log('Question generated');
            
            res.json(question);
        } catch (importError: any) {
            console.error('Error details:', {
                message: importError.message || 'Unknown import error',
                stack: importError.stack,
                path: generatorInfo.path
            });
            throw importError;
        }
    } catch (error: any) {
        console.error('Failed to generate question:', error);
        res.status(500).json({ 
            error: '生成题目失败',
            details: error.message || 'Unknown error'
        });
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