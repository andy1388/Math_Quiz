// 生成器基本信息
export interface GeneratorInfo {
    id: string;
    title: string;
    difficulty: string;
    path: string;
    chapter: {
        id: string;      // 例如: F1_L12_Polynomials
        title: string;   // 例如: F1 L12 Polynomials
        number: string;  // 例如: L12
    };
    section: {
        id: string;      // 例如: F1L12.1_Law_of_Indices
        title: string;   // 例如: Law of Indices
        number: string;  // 例如: 12.1
    };
}

// 生成器列表
export interface GeneratorList {
    id: string;
    title: string;
    difficulty: string;
    path?: string;  // 添加可选的 path 属性
}

// 小节结构
export interface SectionStructure {
    title: string;
    generators: GeneratorList[];
    subSections?: { [key: string]: SectionStructure };  // 添加子目录支持
    path?: string;  // 添加路径属性
}

// 章节结构
export interface ChapterStructure {
    title: string;
    sections?: { [key: string]: SectionStructure };  // 使 sections 变为可选
    generators?: GeneratorList[];  // 添加 generators 字段
}

// Form结构
export interface FormStructure {
    title: string;
    chapters: {
        [chapterId: string]: ChapterStructure;
    };
}

// 完整目录结构
export interface DirectoryStructure {
    [formId: string]: FormStructure;  // key 是 F1, F2 等
}

// 生成器结构
export interface GeneratorStructure {
    [key: string]: {
        title: string;
        generators: GeneratorInfo[];
    };
} 