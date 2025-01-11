"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class IndexGenerator {
    static async generateIndexFiles(startPath) {
        try {
            const files = await fs_1.default.promises.readdir(startPath);
            // 收集当前目录下所有的生成器文件
            const generators = files.filter(f => f.endsWith('_MQ.ts') &&
                !f.endsWith('.d.ts') &&
                !f.endsWith('index.ts'));
            // 如果有生成器文件，创建 index.ts
            if (generators.length > 0) {
                const imports = [];
                const exports = [];
                generators.forEach(file => {
                    const baseName = path_1.default.basename(file, '.ts');
                    const importName = baseName.replace(/\./g, '_');
                    imports.push(`import ${importName} from './${baseName}';`);
                    exports.push(`    '${baseName}': ${importName}`);
                });
                const indexContent = `${imports.join('\n')}\n\nexport const generators = {\n${exports.join(',\n')}\n};\n`;
                await fs_1.default.promises.writeFile(path_1.default.join(startPath, 'index.ts'), indexContent);
            }
            // 递归处理子目录
            for (const file of files) {
                const filePath = path_1.default.join(startPath, file);
                const stat = await fs_1.default.promises.stat(filePath);
                if (stat.isDirectory()) {
                    await this.generateIndexFiles(filePath);
                }
            }
        }
        catch (error) {
            console.error(`Error generating index files: ${error}`);
        }
    }
}
exports.IndexGenerator = IndexGenerator;
// 如果直接运行此脚本
if (require.main === module) {
    const generatorsPath = path_1.default.resolve(__dirname, '..', 'generators');
    IndexGenerator.generateIndexFiles(generatorsPath)
        .then(() => console.log('Index files generated successfully'))
        .catch(err => console.error('Error:', err));
}
