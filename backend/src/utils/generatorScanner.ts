import fs from 'fs';
import path from 'path';
import { GeneratorInfo } from '../types/GeneratorTypes';

export class GeneratorScanner {
    private readonly GENERATORS_PATH: string;
    private generators: Map<string, GeneratorInfo> = new Map();
    private readonly CHAPTER_NAME_MAP: { [key: string]: string } = {
        'Polynomials': '多項式',
        'Law_of_Indices': '指數定律'
    };

    constructor() {
        this.GENERATORS_PATH = path.resolve(__dirname, '..', 'generators');
        console.log('当前目录 (__dirname):', __dirname);
        console.log('解析后的生成器路径:', this.GENERATORS_PATH);
        console.log('路径是否存在:', fs.existsSync(this.GENERATORS_PATH));
        
        if (!fs.existsSync(this.GENERATORS_PATH)) {
            const altPath = path.resolve(process.cwd(), 'src', 'generators');
            console.log('尝试替代路径:', altPath);
            console.log('替代路径是否存在:', fs.existsSync(altPath));
            if (fs.existsSync(altPath)) {
                this.GENERATORS_PATH = altPath;
            } else {
                console.error('无法找到生成器目录。尝试过的路径:');
                console.error('1.', this.GENERATORS_PATH);
                console.error('2.', altPath);
                console.log('当前目录内容:', fs.readdirSync(process.cwd()));
            }
        }

        if (fs.existsSync(this.GENERATORS_PATH)) {
            console.log('生成器目录内容:', fs.readdirSync(this.GENERATORS_PATH));
        }
    }

    async scanGenerators() {
        try {
            console.log('开始扫描生成器...');
            console.log('扫描路径:', this.GENERATORS_PATH);
            
            // 只扫描 F1, F2, F3 等文件夹
            const forms = await fs.promises.readdir(this.GENERATORS_PATH);
            console.log('找到的表单目录:', forms);
            
            for (const form of forms) {
                if (form.startsWith('F')) {
                    const formPath = path.join(this.GENERATORS_PATH, form);
                    console.log('扫描表单目录:', formPath);
                    await this.scanForm(formPath, form);
                }
            }
            
            console.log('扫描完成，找到生成器数量:', this.generators.size);
            return this.generators;
        } catch (error) {
            console.error('扫描生成器失败:', error);
            throw error;
        }
    }

    private async scanForm(formPath: string, form: string) {
        console.log(`扫描 ${form} 目录...`);
        const items = await fs.promises.readdir(formPath);
        console.log(`在 ${form} 中找到的项目:`, items);

        // 遍历所有目录
        for (const item of items) {
            const itemPath = path.join(formPath, item);
            const stat = await fs.promises.stat(itemPath);
            
            if (stat.isDirectory()) {
                console.log(`发现目录: ${item}`);
                // 检查是否包含 'L' 的目录（比如 F1_L12_Polynomials）
                if (item.includes('L')) {
                    console.log(`扫描章节目录: ${itemPath}`);
                    await this.scanChapter(itemPath, form, item);
                } else {
                    // 如果不是以 L 开头，递归扫描子目录
                    console.log(`递归扫描子目录: ${itemPath}`);
                    await this.scanForm(itemPath, form);
                }
            }
        }
    }

    private async scanChapter(chapterPath: string, form: string, chapter: string) {
        console.log(`扫描章节目录: ${chapterPath}`);
        const sections = await fs.promises.readdir(chapterPath);
        console.log(`在章节 ${chapter} 中找到的小节:`, sections);
        
        for (const section of sections) {
            const sectionPath = path.join(chapterPath, section);
            const stat = await fs.promises.stat(sectionPath);
            
            if (stat.isDirectory()) {
                if (section.includes('Law_of_Indices')) {  // 或其他相关条件
                    await this.scanSection(sectionPath, form, chapter, section);
                } else {
                    // 如果不是目标目录，继续递归扫描
                    console.log(`递归扫描子目录: ${sectionPath}`);
                    await this.scanChapter(sectionPath, form, section);
                }
            }
        }
    }

    private async scanSection(sectionPath: string, form: string, chapter: string, section: string) {
        console.log(`扫描小节目录: ${sectionPath}`);
        // 扫描生成器文件
        const files = await fs.promises.readdir(sectionPath);
        console.log(`在小节 ${section} 中找到的文件:`, files);
        
        const generators = files.filter(f => f.endsWith('_MQ.ts'));
        console.log(`找到的生成器文件:`, generators);
        
        for (const file of generators) {
            const filePath = path.join(sectionPath, file);
            console.log(`处理生成器文件: ${filePath}`);
            const info = await this.parseGeneratorInfo(filePath, form, chapter, section);
            if (info) {
                console.log(`成功解析生成器: ${info.id}`);
                this.generators.set(info.id, info);
            } else {
                console.warn(`无法解析生成器: ${filePath}`);
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
            
            // 读取描述文件，只取第一行作为标题
            let title = '';
            if (fs.existsSync(descPath)) {
                const content = await fs.promises.readFile(descPath, 'utf-8');
                title = content.split('\n')[0].trim(); // 只取第一行
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
            console.error(`解析生成器信息失败 ${filePath}:`, error);
            return null;
        }
    }
} 