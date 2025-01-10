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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MC_Maker_1 = require("../generators/MC_Maker");
const router = express_1.default.Router();
// 動態導入生成器
async function loadGenerator(topic) {
    try {
        const generatorPath = constructGeneratorPath(topic);
        if (!generatorPath)
            return null;
        const module = await Promise.resolve(`${generatorPath}`).then(s => __importStar(require(s)));
        return Object.values(module)[0] || null;
    }
    catch (error) {
        console.error('加載生成器失敗:', error);
        return null;
    }
}
function constructGeneratorPath(topic) {
    const generatorsPath = path_1.default.join(__dirname, '../generators');
    // 遞歸搜索目錄找到對應的生成器文件
    const generatorFile = findGeneratorFile(generatorsPath, topic);
    return generatorFile;
}
function findGeneratorFile(baseDir, topic) {
    const files = fs_1.default.readdirSync(baseDir);
    for (const file of files) {
        const fullPath = path_1.default.join(baseDir, file);
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            const found = findGeneratorFile(fullPath, topic);
            if (found)
                return found;
        }
        else if (file.endsWith('Generator_Q1.ts')) {
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
    const difficulty = parseInt(req.query.difficulty) || 1;
    try {
        const GeneratorClass = await loadGenerator(topic);
        if (!GeneratorClass) {
            return res.status(404).json({ error: '題目類型不存在' });
        }
        const generator = new GeneratorClass(difficulty);
        const output = generator.generate();
        const question = MC_Maker_1.MC_Maker.createQuestion(output, difficulty);
        res.json(question);
    }
    catch (error) {
        console.error('生成題目錯誤:', error);
        res.status(500).json({ error: '生成題目時發生錯誤' });
    }
});
router.get('/available-generators', (req, res) => {
    try {
        const generatorsPath = path_1.default.join(__dirname, '../generators');
        console.log('掃描目錄:', generatorsPath);
        const structure = getDirectoryStructure(generatorsPath);
        console.log('目錄結構:', JSON.stringify(structure, null, 2));
        res.json(structure);
    }
    catch (error) {
        console.error('獲取生成器列表失敗:', error);
        res.status(500).json({ error: '無法獲取生成器列表' });
    }
});
function getDirectoryStructure(dir) {
    try {
        const items = fs_1.default.readdirSync(dir);
        const structure = [];
        // 添加排序函數
        function sortByLessonNumber(a, b) {
            // 提取課程編號
            const getNumber = (str) => {
                const match = str.match(/L(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            const numA = getNumber(a);
            const numB = getNumber(b);
            return numA - numB;
        }
        // 排序目錄項目
        items.sort(sortByLessonNumber).forEach(item => {
            const fullPath = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                const children = getDirectoryStructure(fullPath);
                structure.push({
                    name: item,
                    type: 'directory',
                    children: children
                });
            }
            else if (item.endsWith('Generator_Q1.ts')) {
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
    }
    catch (error) {
        console.error('讀取目錄失敗:', dir, error);
        return [];
    }
}
exports.default = router;
