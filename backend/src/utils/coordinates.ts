interface CoordinateSystemOptions {
    showGrid: boolean;
    showAxis: boolean;
    showLabels: boolean;
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    xLabel?: string;  // 添加 x 轴标签选项
    yLabel?: string;  // 添加 y 轴标签选项
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: { x: number; y: number; symbol: string }[] = [];

    constructor(options: CoordinateSystemOptions) {
        this.options = {
            ...options,
            xLabel: options.xLabel || 'x',  // 默认标签
            yLabel: options.yLabel || 'y'   // 默认标签
        };
    }

    addPoint(x: number, y: number, symbol: string = "●") {
        this.points.push({ x, y, symbol });
    }

    toString(): string {
        const { width, height, xRange, yRange, xLabel, yLabel } = this.options;
        
        // 添加边距
        const margin = 30;  // 边距大小
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 计算缩放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;
        
        // 创建 SVG，设置坐标系统
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
            </marker>
        </defs>`;
        
        // 绘制网格
        if (this.options.showGrid) {
            // 垂直网格线
            for (let x = xRange[0]; x <= xRange[1]; x++) {
                const xPos = x * xScale + xOffset;
                svg += `<line x1="${xPos}" y1="${margin}" x2="${xPos}" y2="${height-margin}" stroke="#eee" stroke-width="0.5"/>`;
            }
            // 水平网格线
            for (let y = yRange[0]; y <= yRange[1]; y++) {
                const yPos = yOffset - y * yScale;
                svg += `<line x1="${margin}" y1="${yPos}" x2="${width-margin}" y2="${yPos}" stroke="#eee" stroke-width="0.5"/>`;
            }
        }
        
        // 绘制坐标轴
        if (this.options.showAxis) {
            // x轴
            const yAxisPos = yOffset;
            svg += `<line x1="${margin}" y1="${yAxisPos}" x2="${width-margin}" y2="${yAxisPos}" 
                stroke="black" stroke-width="1" marker-end="url(#arrowhead)"/>`;
            // x轴标签
            svg += `<text x="${width-margin+10}" y="${yAxisPos+20}" font-family="sans-serif">${xLabel}</text>`;
            
            // y轴
            const xAxisPos = xOffset;
            svg += `<line x1="${xAxisPos}" y1="${height-margin}" x2="${xAxisPos}" y2="${margin}" 
                stroke="black" stroke-width="1" marker-end="url(#arrowhead)"/>`;
            // y轴标签
            svg += `<text x="${xAxisPos-20}" y="${margin-10}" font-family="sans-serif">${yLabel}</text>`;
        }
        
        // 绘制点
        for (const point of this.points) {
            const xPos = point.x * xScale + xOffset;
            const yPos = yOffset - point.y * yScale;
            svg += `<circle cx="${xPos}" cy="${yPos}" r="3" fill="black"/>`;
        }
        
        svg += '</svg>';
        
        return svg;
    }
} 