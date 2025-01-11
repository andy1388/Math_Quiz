"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generatorScanner_1 = require("../utils/generatorScanner");
const router = express_1.default.Router();
const scanner = new generatorScanner_1.GeneratorScanner();
let generatorCache = new Map();
// 初始化时扫描所有生成器
async function initializeGenerators() {
    try {
        generatorCache = await scanner.scanGenerators();
    }
    catch (error) {
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
    }
    catch (error) {
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
            const GeneratorClass = (await Promise.resolve(`${generatorInfo.path}`).then(s => __importStar(require(s)))).default;
            console.log('Generator class loaded:', !!GeneratorClass);
            const generator = new GeneratorClass(Number(difficulty));
            console.log('Generator instance created');
            const question = generator.generate();
            console.log('Question generated');
            res.json(question);
        }
        catch (importError) {
            console.error('Error details:', {
                message: importError.message || 'Unknown import error',
                stack: importError.stack,
                path: generatorInfo.path
            });
            throw importError;
        }
    }
    catch (error) {
        console.error('Failed to generate question:', error);
        res.status(500).json({
            error: '生成题目失败',
            details: error.message || 'Unknown error'
        });
    }
});
// 组织生成器结构
function organizeGenerators(generators) {
    const structure = {};
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
exports.default = router;
