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
        const items = await fs.promises.readdir(formPath);

        // 遍历所有目录
        for (const item of items) {
            const itemPath = path.join(formPath, item);
            const stat = await fs.promises.stat(itemPath);
            
            if (stat.isDirectory()) {
                // 检查是否包含 'L' 的目录（比如 F1_L12_Polynomials）
                if (item.includes('L')) {
                    await this.scanChapter(itemPath, form, item);
                } else {
                    // 如果不是以 L 开头，递归扫描子目录
                    await this.scanForm(itemPath, form);
                }
            }
        }
    }

    private async scanChapter(chapterPath: string, form: string, chapter: string) {
        const sections = await fs.promises.readdir(chapterPath);
        
        for (const section of sections) {
            const sectionPath = path.join(chapterPath, section);
            const stat = await fs.promises.stat(sectionPath);
            
            if (stat.isDirectory()) {
                if (section.includes('Law_of_Indices') || 
                    section.includes('Cross_Method')) {  // 添加新的条件
                    await this.scanSection(sectionPath, form, chapter, section);
                } else {
                    // 如果不是目标目录，继续递归扫描
                    await this.scanChapter(sectionPath, form, section);
                }
            }
        }
    }

    private async scanSection(sectionPath: string, form: string, chapter: string, section: string) {
        // 扫描生成器文件
        const files = await fs.promises.readdir(sectionPath);
        
        const generators = files.filter(f => f.endsWith('_MQ.ts'));
        
        for (const file of generators) {
            const filePath = path.join(sectionPath, file);
            const info = await this.parseGeneratorInfo(filePath, form, chapter, section);
            if (info) {
                this.generators.set(info.id, info);
            }
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
            
            // 读取描述文件，取第二行（英文标题）
            let title = '';
            if (fs.existsSync(descPath)) {
                const content = await fs.promises.readFile(descPath, 'utf-8');
                const lines = content.split('\n');
                title = lines[1].trim(); // 取第二行（英文标题）
            } else {
                title = fileName;
            }

            // 直接使用文件夹名称
            const chapterTitle = chapter.split('_').slice(1).join(' '); // 移除 F1_ 前缀
            const sectionTitle = section.split('_').slice(1).join(' '); // 移除 F1L12.1_ 前缀

            return {
                id: fileName,
                title,
                difficulty: '1',
                path: filePath,
                chapter: {
                    id: chapter,
                    title: `${form} ${chapterTitle}`, // 例如："F1 L12 Polynomials"
                    number: chapter.match(/L\d+/)?.[0] || ''
                },
                section: {
                    id: section,
                    title: sectionTitle, // 例如："Law of Indices"
                    number: section.match(/\d+\.\d+/)?.[0] || ''
                }
            };
        } catch (error) {
            return null;
        }
    }
} 