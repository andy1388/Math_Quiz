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

    addPoint(x: number, y: number, symbol: string = "●") {
        this.points.push({ x, y, symbol });
    }

    toString(): string {
        const { width, height, xRange, yRange } = this.options;
        
        // 计算缩放和偏移
        const xScale = width / (xRange[1] - xRange[0]);
        const yScale = height / (yRange[1] - yRange[0]);
        const xOffset = -xRange[0] * xScale;
        const yOffset = height + yRange[0] * yScale;
        
        // 创建 SVG，设置坐标系统
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // 绘制网格
        if (this.options.showGrid) {
            // 垂直网格线
            for (let x = xRange[0]; x <= xRange[1]; x++) {
                const xPos = x * xScale + xOffset;
                svg += `<line x1="${xPos}" y1="0" x2="${xPos}" y2="${height}" stroke="#eee" stroke-width="0.5"/>`;
            }
            // 水平网格线
            for (let y = yRange[0]; y <= yRange[1]; y++) {
                const yPos = yOffset - y * yScale;
                svg += `<line x1="0" y1="${yPos}" x2="${width}" y2="${yPos}" stroke="#eee" stroke-width="0.5"/>`;
            }
        }
        
        // 绘制坐标轴
        if (this.options.showAxis) {
            // x轴
            const yAxisPos = yOffset;
            svg += `<line x1="0" y1="${yAxisPos}" x2="${width}" y2="${yAxisPos}" stroke="black" stroke-width="1"/>`;
            // y轴
            const xAxisPos = xOffset;
            svg += `<line x1="${xAxisPos}" y1="0" x2="${xAxisPos}" y2="${height}" stroke="black" stroke-width="1"/>`;
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