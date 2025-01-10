// 章节信息
export interface ChapterInfo {
    id: string;        // 例如: "L12 Polynomials"
    title: string;     // 例如: "F1 Polynomials"
    number: string;    // 例如: "L12"
}

// 小节信息
export interface SectionInfo {
    id: string;        // 例如: "12.1 Law of Indices"
    title: string;     // 例如: "Law of Indices"
    number: string;    // 例如: "12.1"
}

// 生成器信息
export interface GeneratorInfo {
    id: string;           // 生成器ID (例如: F1L12.1_Q1_F_MQ)
    title: string;        // 标题 (例如: 指數運算)
    difficulty: string;   // 难度 (例如: 基礎)
    path: string;         // 文件路径
    chapter: ChapterInfo; // 章节信息
    section: SectionInfo; // 小节信息
}

// 生成器结构
export interface GeneratorStructure {
    id: string;
    title: string;
    difficulty: string;
}

// 小节结构
export interface SectionStructure {
    title: string;
    generators: GeneratorStructure[];
}

// 章节结构
export interface ChapterStructure {
    title: string;
    sections: Record<string, SectionStructure>;
}

// 目录结构
export interface DirectoryStructure {
    [key: string]: ChapterStructure;
} 