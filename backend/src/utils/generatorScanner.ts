import fs from 'fs';
import path from 'path';
import { 
    GeneratorInfo, 
    DirectoryStructure, 
    ChapterStructure, 
    SectionStructure 
} from '../types/GeneratorTypes';

export class GeneratorScanner {
    private readonly GENERATORS_PATH: string;
    private static structureCache: DirectoryStructure | null = null;

    constructor() {
        this.GENERATORS_PATH = path.resolve(__dirname, '..', 'generators');
        if (!fs.existsSync(this.GENERATORS_PATH)) {
            const altPath = path.resolve(process.cwd(), 'src', 'generators');
            if (fs.existsSync(altPath)) {
                this.GENERATORS_PATH = altPath;
            } else {
                throw new Error('无法找到生成器目录');
            }
        }
    }

    // 只扫描基本结构
    async scanBasicStructure() {
        // 如果缓存存在，直接返回
        if (GeneratorScanner.structureCache) {
            return GeneratorScanner.structureCache;
        }

        try {
            const forms = await fs.promises.readdir(this.GENERATORS_PATH);
            const structure: DirectoryStructure = {};

            for (const form of forms) {
                if (form.startsWith('F')) {
                    const formPath = path.join(this.GENERATORS_PATH, form);
                    const formStat = await fs.promises.stat(formPath);
                    
                    if (formStat.isDirectory()) {
                        structure[form] = {
                            title: form,
                            chapters: await this.scanChaptersBasic(formPath)
                        };
                    }
                }
            }

            // 保存到缓存
            GeneratorScanner.structureCache = structure;
            return structure;
        } catch (error) {
            throw error;
        }
    }

    private async scanChaptersBasic(formPath: string) {
        const chapters: { [key: string]: ChapterStructure } = {};
        const items = await fs.promises.readdir(formPath);

        // 按L数字排序
        const sortedItems = items
            .filter(item => item.includes('L'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/L(\d+)/)?.[1] || '0');
                const numB = parseInt(b.match(/L(\d+)/)?.[1] || '0');
                return numA - numB;
            });

        for (const item of sortedItems) {
            const chapterPath = path.join(formPath, item);
            const stat = await fs.promises.stat(chapterPath);
            
            if (stat.isDirectory()) {
                chapters[item] = {
                    title: item,
                    sections: await this.scanSectionsBasic(chapterPath)
                };
            }
        }
        return chapters;
    }

    private async scanSectionsBasic(chapterPath: string) {
        const sections: { [key: string]: SectionStructure } = {};
        const items = await fs.promises.readdir(chapterPath);

        // 按小节编号排序
        const sortedItems = items.sort((a, b) => {
            const numA = parseFloat(a.match(/\d+\.\d+/)?.[0] || '0');
            const numB = parseFloat(b.match(/\d+\.\d+/)?.[0] || '0');
            return numA - numB;
        });

        for (const item of sortedItems) {
            const sectionPath = path.join(chapterPath, item);
            const stat = await fs.promises.stat(sectionPath);
            
            if (stat.isDirectory()) {
                sections[item] = {
                    title: item,
                    generators: []
                };
            }
        }
        return sections;
    }

    // 扫描特定文件夹的生成器
    async scanFolderGenerators(folderPath: string) {
        const fullPath = path.join(this.GENERATORS_PATH, folderPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error('Folder not found');
        }

        const files = await fs.promises.readdir(fullPath);
        return files
            .filter(f => f.endsWith('_MQ.ts'))
            .map(file => {
                const filePath = path.join(fullPath, file);
                const descPath = filePath.replace('.ts', '.desc.txt');
                
                let title = file;
                let difficulty = '1';
                if (fs.existsSync(descPath)) {
                    const content = fs.readFileSync(descPath, 'utf-8');
                    const lines = content.split('\n');
                    title = lines[1].trim();
                }

                return {
                    id: path.basename(file, '.ts'),
                    title,
                    difficulty
                };
            });
    }

    // 清除缓存的方法（如果需要）
    static clearCache() {
        GeneratorScanner.structureCache = null;
    }
} 