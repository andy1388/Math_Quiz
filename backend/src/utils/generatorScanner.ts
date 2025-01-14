import fs from 'fs';
import path from 'path';
import { 
    GeneratorInfo, 
    DirectoryStructure, 
    ChapterStructure, 
    SectionStructure,
    GeneratorList 
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
                // 检查是否有子目录
                const subDirs = await this.scanSubSections(sectionPath);
                const generators = await this.scanGeneratorsInPath(sectionPath);
                
                sections[item] = {
                    title: item,
                    generators: generators,
                    subSections: subDirs  // 添加子目录
                };
            }
        }
        return sections;
    }

    // 新增：扫描第4层子目录
    private async scanSubSections(sectionPath: string) {
        const subSections: { [key: string]: SectionStructure } = {};
        const items = await fs.promises.readdir(sectionPath);

        // 按编号排序（支持 x.x.x 格式）
        const sortedItems = items.sort((a, b) => {
            const numA = a.match(/\d+\.\d+\.\d+/)?.[0] || a;
            const numB = b.match(/\d+\.\d+\.\d+/)?.[0] || b;
            return numA.localeCompare(numB);
        });

        for (const item of sortedItems) {
            const subSectionPath = path.join(sectionPath, item);
            const stat = await fs.promises.stat(subSectionPath);
            
            if (stat.isDirectory()) {
                const generators = await this.scanGeneratorsInPath(subSectionPath);
                subSections[item] = {
                    title: item,
                    generators: generators
                };
            }
        }
        return Object.keys(subSections).length > 0 ? subSections : undefined;
    }

    // 新增：扫描指定路径下的生成器文件
    private async scanGeneratorsInPath(dirPath: string): Promise<GeneratorList[]> {
        try {
            const files = await fs.promises.readdir(dirPath);
            const generators = files
                .filter(f => f.endsWith('_MQ.ts'))
                .map(file => {
                    const filePath = path.join(dirPath, file);
                    const descPath = filePath.replace('.ts', '.desc.txt');
                    
                    let title = file;
                    let difficulty = '1';
                    if (fs.existsSync(descPath)) {
                        const content = fs.readFileSync(descPath, 'utf-8');
                        const lines = content.split('\n');
                        title = lines[1]?.trim() || file;
                    }

                    return {
                        id: path.basename(file, '.ts'),
                        title,
                        difficulty
                    };
                });
            return generators;
        } catch (error) {
            console.error(`Error scanning generators in ${dirPath}:`, error);
            return [];
        }
    }

    // 修改扫描文件夹生成器的方法
    async scanFolderGenerators(folderPath: string) {
        const fullPath = path.join(this.GENERATORS_PATH, folderPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error('Folder not found');
        }

        const generators: GeneratorInfo[] = [];
        const self = this;
        
        const extractInfo = (filePath: string) => {
            const parts = filePath.split(path.sep);
            const chapterPart = parts.find(p => p.includes('_L'));
            const sectionPart = parts.find(p => p.match(/L\d+\.\d+/));
            const subSectionPart = parts.find(p => p.match(/L\d+\.\d+\.\d+/));

            const chapterMatch = chapterPart?.match(/F\d+_L(\d+)_(.+)/);
            const sectionMatch = sectionPart?.match(/F\d+L(\d+\.\d+)_(.+)/);
            const subSectionMatch = subSectionPart?.match(/F\d+L(\d+\.\d+\.\d+)_(.+)/);

            return {
                chapter: {
                    id: chapterPart || '',
                    title: chapterPart?.replace(/_/g, ' ') || '',
                    number: chapterMatch ? `L${chapterMatch[1]}` : ''
                },
                section: {
                    id: sectionPart || '',
                    title: sectionMatch ? sectionMatch[2].replace(/_/g, ' ') : '',
                    number: sectionMatch ? sectionMatch[1] : ''
                },
                subSection: subSectionMatch ? {
                    id: subSectionPart || '',
                    title: subSectionMatch[2].replace(/_/g, ' '),
                    number: subSectionMatch[1]
                } : undefined
            };
        };
        
        // 使用箭头函数来保持 this 的指向
        const scanDir = async (dirPath: string) => {
            const files = await fs.promises.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.promises.stat(filePath);
                
                if (stat.isDirectory()) {
                    // 递归扫描子目录
                    await scanDir(filePath);
                } else if (file.endsWith('_MQ.ts')) {
                    const descPath = filePath.replace('.ts', '.desc.txt');
                    
                    let title = file;
                    let difficulty = '1';
                    if (fs.existsSync(descPath)) {
                        const content = fs.readFileSync(descPath, 'utf-8');
                        const lines = content.split('\n');
                        title = lines[1].trim();
                    }

                    const info = extractInfo(path.relative(self.GENERATORS_PATH, filePath));
                    
                    generators.push({
                        id: path.basename(file, '.ts'),
                        title,
                        difficulty,
                        path: path.relative(fullPath, filePath),
                        chapter: info.chapter,
                        section: info.section
                    });
                }
            }
        };

        await scanDir(fullPath);
        return generators;
    }

    // 清除缓存的方法（如果需要）
    static clearCache() {
        GeneratorScanner.structureCache = null;
    }
} 