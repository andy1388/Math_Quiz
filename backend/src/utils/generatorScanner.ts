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
                if (form.startsWith('F')) {  // 扫描所有以 F 开头的文件夹
                    const formPath = path.join(this.GENERATORS_PATH, form);
                    await this.scanForm(formPath, form);
                }
            }
            return this.generators;
        } catch (error) {
            console.error('扫描生成器时出错:', error);
            throw error;
        }
    }

    private async scanForm(formPath: string, form: string) {
        try {
            const items = await fs.promises.readdir(formPath);
            
            for (const item of items) {
                const itemPath = path.join(formPath, item);
                const stat = await fs.promises.stat(itemPath);
                
                if (stat.isDirectory()) {
                    // 检查所有目录，不仅仅是包含 'L' 的目录
                    await this.scanChapter(itemPath, form, item);
                }
            }
        } catch (error) {
            console.error(`扫描表单 ${form} 时出错:`, error);
        }
    }

    private async scanChapter(chapterPath: string, form: string, chapter: string) {
        try {
            const sections = await fs.promises.readdir(chapterPath);
            
            for (const section of sections) {
                const sectionPath = path.join(chapterPath, section);
                const stat = await fs.promises.stat(sectionPath);
                
                if (stat.isDirectory()) {
                    // 扫描所有子目录
                    await this.scanSection(sectionPath, form, chapter, section);
                    // 递归扫描更深层的目录
                    await this.scanChapter(sectionPath, form, section);
                }
            }
        } catch (error) {
            console.error(`扫描章节 ${chapter} 时出错:`, error);
        }
    }

    private async scanSection(sectionPath: string, form: string, chapter: string, section: string) {
        try {
            const files = await fs.promises.readdir(sectionPath);
            
            // 扫描所有以 _MQ.ts 结尾的生成器文件
            const generators = files.filter(f => f.endsWith('_MQ.ts'));
            
            for (const file of generators) {
                const filePath = path.join(sectionPath, file);
                const info = await this.parseGeneratorInfo(filePath, form, chapter, section);
                if (info) {
                    this.generators.set(info.id, info);
                }
            }
        } catch (error) {
            console.error(`扫描小节 ${section} 时出错:`, error);
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
            
            let title = '';
            if (fs.existsSync(descPath)) {
                const content = await fs.promises.readFile(descPath, 'utf-8');
                const lines = content.split('\n');
                title = lines[1].trim(); // 取第二行（英文标题）
            } else {
                title = fileName;
            }

            const chapterTitle = chapter.split('_').slice(1).join(' ');
            const sectionTitle = section.split('_').slice(1).join(' ');

            return {
                id: fileName,
                title,
                difficulty: '1',
                path: filePath,
                chapter: {
                    id: chapter,
                    title: `${form} ${chapterTitle}`,
                    number: chapter.match(/L\d+/)?.[0] || ''
                },
                section: {
                    id: section,
                    title: sectionTitle,
                    number: section.match(/\d+\.\d+/)?.[0] || ''
                }
            };
        } catch (error) {
            console.error(`解析生成器信息时出错 ${filePath}:`, error);
            return null;
        }
    }
} 