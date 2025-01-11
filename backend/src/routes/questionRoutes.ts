import express from 'express';
import { GeneratorScanner } from '../utils/generatorScanner';
import { 
    GeneratorInfo, 
    GeneratorStructure, 
    SectionStructure, 
    ChapterStructure, 
    DirectoryStructure 
} from '../types/GeneratorTypes';
import { QuestionGeneratorFactory } from '../generators/QuestionGeneratorFactory';
import { MC_Maker } from '../generators/MC_Maker';
import { Request, Response } from 'express';

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
        console.log('Raw generators:', JSON.stringify(generators, null, 2));
        const structure = organizeGenerators(generators);
        console.log('Organized structure:', JSON.stringify(structure, null, 2));
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

// 组织生成器结构
function organizeGenerators(generators: GeneratorInfo[]): DirectoryStructure {
    const structure: DirectoryStructure = {};
    
    // 按Form分组
    const formGroups = new Map<string, GeneratorInfo[]>();
    generators.forEach(gen => {
        const formId = gen.chapter.id.split('_')[0]; // 获取 F1, F2 等
        if (!formGroups.has(formId)) {
            formGroups.set(formId, []);
        }
        formGroups.get(formId)?.push(gen);
    });

    // 为每个Form创建结构
    formGroups.forEach((formGenerators, formId) => {
        structure[formId] = {
            title: `Form ${formId.substring(1)}`,
            chapters: {}
        };

        // 按章节分组
        const chapterGroups = new Map<string, GeneratorInfo[]>();
        formGenerators.forEach(gen => {
            const chapterId = gen.chapter.id;
            if (!chapterGroups.has(chapterId)) {
                chapterGroups.set(chapterId, []);
            }
            chapterGroups.get(chapterId)?.push(gen);
        });

        // 为每个章节创建结构
        chapterGroups.forEach((chapterGenerators, chapterId) => {
            structure[formId].chapters[chapterId] = {
                title: chapterGenerators[0].chapter.title,
                sections: {}
            };

            // 按小节分组并添加生成器
            chapterGenerators.forEach(gen => {
                const sectionId = gen.section.id;
                if (!structure[formId].chapters[chapterId].sections[sectionId]) {
                    structure[formId].chapters[chapterId].sections[sectionId] = {
                        title: gen.section.title,
                        generators: []
                    };
                }
                structure[formId].chapters[chapterId].sections[sectionId].generators.push({
                    id: gen.id,
                    title: gen.title,
                    difficulty: gen.difficulty
                });
            });
        });
    });

    console.log('Final structure:', JSON.stringify(structure, null, 2));
    return structure;
}

// 启动时初始化
initializeGenerators().catch(console.error);

export default router; 