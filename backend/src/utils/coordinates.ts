interface CoordinateSystemOptions {
    showGrid: boolean;
    showAxis: boolean;
    showLabels: boolean;
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: { x: number; y: number; symbol: string }[] = [];

    constructor(options: CoordinateSystemOptions) {
        this.options = options;
    }

    addPoint(x: number, y: number, symbol: string = "\\bullet") {
        this.points.push({ x, y, symbol });
    }

    toString(): string {
        const { xRange, yRange } = this.options;
        
        // 使用 array 环境，设置列对齐
        let latex = `$\\begin{array}{${'.'.repeat(xRange[1] - xRange[0] + 1)}}\n`;
        
        // 创建坐标系网格
        for (let y = yRange[1]; y >= yRange[0]; y--) {
            let row = '';
            for (let x = xRange[0]; x <= xRange[1]; x++) {
                // 检查是否是点的位置
                const point = this.points.find(p => p.x === x && p.y === y);
                if (point) {
                    row += '\\bullet';  // 大点
                }
                // 检查是否是坐标轴
                else if (this.options.showAxis && y === 0) {
                    row += '\\text{-}';  // 横线
                }
                else if (this.options.showAxis && x === 0) {
                    row += '\\text{|}';  // 竖线
                }
                // 检查是否是网格点
                else if (this.options.showGrid) {
                    row += '\\cdot';  // 小点
                }
                else {
                    row += ' ';  // 空格
                }

                // 添加列分隔符
                if (x < xRange[1]) {
                    row += ' & ';
                }
            }
            latex += row + '\\\\\n';
        }
        
        latex += `\\end{array}$`;
        
        return latex;
    }
} 