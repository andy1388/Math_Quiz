import fs from 'fs';
import path from 'path';
import { GeneratorInfo } from '../types/GeneratorTypes';

export class GeneratorScanner {
    private readonly GENERATORS_PATH: string;
    private generators: Map<string, GeneratorInfo> = new Map();

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

    async scanGenerators() {
        try {
            const forms = await fs.promises.readdir(this.GENERATORS_PATH);
            for (const form of forms) {
                if (form.startsWith('F')) {
                    const formPath = path.join(this.GENERATORS_PATH, form);
                    await this.scanForm(formPath, form);
                }
            }
            return this.generators;
        } catch (error) {
            throw error;
        }
    }

    private async scanForm(formPath: string, form: string) {
        try {
            const items = await fs.promises.readdir(formPath);
            console.log(`Scanning form ${form}, found items:`, items);

            // 遍历所有目录
            for (const item of items) {
                const itemPath = path.join(formPath, item);
                const stat = await fs.promises.stat(itemPath);
                
                if (stat.isDirectory()) {
                    // 检查是否是章节目录（例如 L12_Polynomials）
                    if (item.includes('L')) {
                        console.log(`Found chapter: ${item}`);
                        await this.scanChapter(itemPath, form, item);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning form ${form}:`, error);
        }
    }

    private async scanChapter(chapterPath: string, form: string, chapter: string) {
        try {
            const sections = await fs.promises.readdir(chapterPath);
            console.log(`Scanning chapter ${chapter}, found sections:`, sections);
            
            for (const section of sections) {
                const sectionPath = path.join(chapterPath, section);
                const stat = await fs.promises.stat(sectionPath);
                
                if (stat.isDirectory()) {
                    // 扫描所有小节，不再限制特定名称
                    console.log(`Found section: ${section}`);
                    await this.scanSection(sectionPath, form, chapter, section);
                }
            }
        } catch (error) {
            console.error(`Error scanning chapter ${chapter}:`, error);
        }
    }

    private async scanSection(sectionPath: string, form: string, chapter: string, section: string) {
        try {
            const files = await fs.promises.readdir(sectionPath);
            console.log(`Scanning section ${section}, found files:`, files);
            
            // 查找生成器文件
            const generators = files.filter(f => f.endsWith('_MQ.ts'));
            console.log(`Found generators:`, generators);
            
            for (const file of generators) {
                const filePath = path.join(sectionPath, file);
                const info = await this.parseGeneratorInfo(filePath, form, chapter, section);
                if (info) {
                    this.generators.set(info.id, info);
                    console.log(`Added generator: ${info.id}`);
                }
            }
        } catch (error) {
            console.error(`Error scanning section ${section}:`, error);
        }
    }

    private async parseGeneratorInfo(
        filePath: string, 
        form: string, 
        chapter: string, 
        section: string
    ): Promise<GeneratorInfo | null> {
        try {
            const fileName = path.basename(filePath, '.ts');
            const descPath = filePath.replace('.ts', '.desc.txt');
            
            // 读取描述文件
            let title = '';
            if (fs.existsSync(descPath)) {
                const content = await fs.promises.readFile(descPath, 'utf-8');
                const lines = content.split('\n');
                title = lines[1].trim(); // 取第二行（英文标题）
            } else {
                title = fileName;
            }

            // 解析章节和小节信息，确保所有空格都转换为下划线
            const formNumber = form.match(/F\d+/)?.[0] || '';
            const chapterNumber = chapter.match(/L\d+/)?.[0] || '';
            const chapterName = chapter.split('_')
                .slice(2)
                .join('_')
                .replace(/\s+/g, '_');  // 替换空格为下划线

            const sectionName = section.split('_')
                .slice(-2)
                .join('_')
                .replace(/\s+/g, '_');  // 替换空格为下划线

            // 构建ID时确保使用下划线
            const chapterId = `${formNumber}_${chapterNumber}_${chapterName}`.replace(/\s+/g, '_');
            const sectionId = sectionName;

            return {
                id: fileName,
                title,
                difficulty: '1',
                path: filePath,
                chapter: {
                    id: chapterId,  // 例如: F1_L12_Polynomials
                    title: `${formNumber} ${chapterNumber} ${chapterName.replace(/_/g, ' ')}`, // 显示时用空格
                    number: chapterNumber
                },
                section: {
                    id: sectionId,  // 例如: Law_of_Indices
                    title: sectionName.replace(/_/g, ' '), // 显示时用空格
                    number: section.match(/\d+\.\d+/)?.[0] || ''
                }
            };
        } catch (error) {
            console.error('Error parsing generator info:', error);
            return null;
        }
    }
} 