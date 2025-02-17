interface CoordinateSystemOptions {
    showGrid: boolean;
    showAxis: boolean;
    showLabels: boolean;
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    xLabel?: string;
    yLabel?: string;
}

interface LineEquation {
    slope: number;
    yIntercept: number;
    showEquation?: boolean;
    color: string;
    style?: string;
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: { x: number; y: number; symbol: string; label?: string }[] = [];
    private lines: { from: [number, number]; to: [number, number]; color: string; style?: string }[] = [];
    private verticalLines: { x: number; color: string; style?: string }[] = [];
    private equations: LineEquation[] = [];

    constructor(options: CoordinateSystemOptions) {
        this.options = {
            ...options,
            xLabel: options.xLabel || 'x',
            yLabel: options.yLabel || 'y'
        };
    }

    addPoint(x: number, y: number, symbol: string = "●", label?: string) {
        this.points.push({ x, y, symbol, label });
    }

    addLine(from: [number, number], to: [number, number], color: string = "green", style: string = "solid") {
        this.lines.push({ from, to, color, style });
    }

    addVerticalLine(x: number, color: string = "black", style: string = "dotted") {
        this.verticalLines.push({ x, color, style });
    }

    addObliqueLine(slope: number, yIntercept: number, color: string = "red", style: string = "solid", showEquation: boolean = false) {
        const { xRange } = this.options;
        
        // 计算直线在视图范围内的两个端点
        const x1 = xRange[0];
        const y1 = slope * x1 + yIntercept;
        const x2 = xRange[1];
        const y2 = slope * x2 + yIntercept;
        
        // 添加线段
        this.lines.push({
            from: [x1, y1],
            to: [x2, y2],
            color,
            style
        });

        // 添加方程
        this.equations.push({
            slope,
            yIntercept,
            showEquation,
            color
        });
    }

    toString(): string {
        const { width, height, xRange, yRange, xLabel, yLabel } = this.options;
        
        // 添加边距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 计算缩放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;
        
        // 创建 SVG
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
            svg += `<text x="${width-margin+10}" y="${yAxisPos+20}" 
                style="font-family: serif; font-style: italic; font-size: 16px">${xLabel}</text>`;
            
            // y轴
            const xAxisPos = xOffset;
            svg += `<line x1="${xAxisPos}" y1="${height-margin}" x2="${xAxisPos}" y2="${margin}" 
                stroke="black" stroke-width="1" marker-end="url(#arrowhead)"/>`;
            // y轴标签
            svg += `<text x="${xAxisPos-20}" y="${margin-10}" 
                style="font-family: serif; font-style: italic; font-size: 16px">${yLabel}</text>`;
        }
        
        // 绘制垂直线
        for (const line of this.verticalLines) {
            const xPos = line.x * xScale + xOffset;
            svg += `<line x1="${xPos}" y1="${margin}" x2="${xPos}" y2="${height-margin}" 
                stroke="${line.color}" stroke-width="1" stroke-dasharray="${line.style === 'dotted' ? '4,4' : ''}"/>`;
        }
        
        // 绘制普通线段和方程
        for (const line of this.lines) {
            const x1 = line.from[0] * xScale + xOffset;
            const y1 = yOffset - line.from[1] * yScale;
            const x2 = line.to[0] * xScale + xOffset;
            const y2 = yOffset - line.to[1] * yScale;
            
            // 绘制线段
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                stroke="${line.color}" stroke-width="2" stroke-dasharray="${line.style === 'dotted' ? '4,4' : ''}"/>`;
        }

        // 绘制方程标签
        for (const eq of this.equations) {
            if (eq.showEquation) {
                // 计算直线中点位置
                const { xRange } = this.options;
                const midX = (xRange[0] + xRange[1]) / 2;
                const midY = eq.slope * midX + eq.yIntercept;
                
                // 转换为 SVG 坐标
                const labelX = midX * xScale + xOffset + 10;  // 稍微偏移以避免遮挡线段
                const labelY = yOffset - midY * yScale - 10;
                
                // 构建方程文本
                let equationText = 'y = ';
                if (eq.slope !== 0) {
                    equationText += eq.slope === 1 ? 'x' : 
                                  eq.slope === -1 ? '-x' : 
                                  `${eq.slope}x`;
                }
                if (eq.yIntercept !== 0 || eq.slope === 0) {
                    const sign = eq.yIntercept > 0 ? '+' : '';
                    equationText += eq.slope !== 0 ? `${sign}${eq.yIntercept}` : eq.yIntercept;
                }

                // 添加方程标签
                svg += `<text x="${labelX}" y="${labelY}" 
                    style="font-family: serif; font-style: italic; font-size: 14px; fill: ${eq.color}">${equationText}</text>`;
            }
        }
        
        // 绘制点和标签
        for (const point of this.points) {
            const xPos = point.x * xScale + xOffset;
            const yPos = yOffset - point.y * yScale;
            
            // 绘制点
            svg += `<circle cx="${xPos}" cy="${yPos}" r="3" fill="black"/>`;
            
            // 如果有标签，则绘制标签
            if (point.label) {
                // 计算标签位置（右上方偏移）
                const labelX = xPos + 10;
                const labelY = yPos - 10;
                svg += `<text x="${labelX}" y="${labelY}" 
                    style="font-family: serif; font-size: 14px">${point.label}</text>`;
            }
        }
        
        svg += '</svg>';
        
        return svg;
    }
} 