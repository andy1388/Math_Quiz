interface CoordinateSystemOptions {
    // 基本选项
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    
    // 网格线选项
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;
    showHorizontalGrid?: boolean;  // 控制水平网格线
    showVerticalGrid?: boolean;    // 控制垂直网格线
    
    // 坐标轴选项
    showAxis?: boolean;
    axisColor?: string;
    axisWidth?: number;
    showXAxis?: boolean;           // 控制 x 轴
    showYAxis?: boolean;           // 控制 y 轴
    showArrows?: boolean;          // 控制箭头
    
    // 标签选项
    showLabels?: boolean;
    xLabel?: string;
    yLabel?: string;
    labelColor?: string;
    labelSize?: number;
}

interface LineEquation {
    slope: number;
    yIntercept: number;
    showEquation?: boolean;
    color: string;
    style?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface PointLabel {
    x: number;
    y: number;
    symbol: string;
    label?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface FunctionEquation {
    fn: (x: number) => number;  // 函数表达式
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;          // 方程的显示文本
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface CircleEquation {
    centerX: number;
    centerY: number;
    radius: number;
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: PointLabel[] = [];
    private lines: { from: [number, number]; to: [number, number]; color: string; style?: string }[] = [];
    private verticalLines: { x: number; color: string; style?: string }[] = [];
    private equations: LineEquation[] = [];
    private functions: FunctionEquation[] = [];  // 新增：函数数组
    private circles: CircleEquation[] = [];  // 新增：圆形数组

    constructor(options: CoordinateSystemOptions) {
        // 设置默认值
        this.options = {
            ...options,
            // 网格线默认值
            showGrid: options.showGrid ?? true,
            gridColor: options.gridColor ?? '#eee',
            gridOpacity: options.gridOpacity ?? 1,
            showHorizontalGrid: options.showHorizontalGrid ?? true,
            showVerticalGrid: options.showVerticalGrid ?? true,
            
            // 坐标轴默认值
            showAxis: options.showAxis ?? true,
            axisColor: options.axisColor ?? 'black',
            axisWidth: options.axisWidth ?? 1,
            showXAxis: options.showXAxis ?? true,
            showYAxis: options.showYAxis ?? true,
            showArrows: options.showArrows ?? true,
            
            // 标签默认值
            showLabels: options.showLabels ?? true,
            xLabel: options.xLabel ?? 'x',
            yLabel: options.yLabel ?? 'y',
            labelColor: options.labelColor ?? 'black',
            labelSize: options.labelSize ?? 16
        };
    }

    addPoint(x: number, y: number, symbol: string = "●", label?: string, labelOffsetX: number = 10, labelOffsetY: number = -10) {
        this.points.push({ x, y, symbol, label, labelOffsetX, labelOffsetY });
    }

    addLine(from: [number, number], to: [number, number], color: string = "green", style: string = "solid") {
        this.lines.push({ from, to, color, style });
    }

    addVerticalLine(x: number, color: string = "black", style: string = "dotted") {
        this.verticalLines.push({ x, color, style });
    }

    addObliqueLine(
        slope: number, 
        yIntercept: number, 
        color: string = "red", 
        style: string = "solid", 
        showEquation: boolean = false,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15
    ) {
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
            color,
            style,
            labelOffsetX,
            labelOffsetY
        });
    }

    addFunction(
        fn: (x: number) => number,
        color: string = "yellow",
        style: string = "solid",
        showEquation: boolean = false,
        equation?: string,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15,
        segments: number = 100  // 用于控制曲线的平滑度
    ) {
        this.functions.push({
            fn,
            color,
            style,
            showEquation,
            equation,
            labelOffsetX,
            labelOffsetY
        });
    }

    addCircle(
        centerX: number,
        centerY: number,
        radius: number,
        color: string = "purple",
        style: string = "solid",
        showEquation: boolean = false,
        equation?: string,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15
    ) {
        this.circles.push({
            centerX,
            centerY,
            radius,
            color,
            style,
            showEquation,
            equation,
            labelOffsetX,
            labelOffsetY
        });
    }

    toString(): string {
        const { width, height, xRange, yRange } = this.options;
        
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
            if (this.options.showVerticalGrid) {
                for (let x = xRange[0]; x <= xRange[1]; x++) {
                    const xPos = x * xScale + xOffset;
                    svg += `<line x1="${xPos}" y1="${margin}" x2="${xPos}" y2="${height-margin}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="0.5"
                        opacity="${this.options.gridOpacity}"/>`;
                }
            }
            // 水平网格线
            if (this.options.showHorizontalGrid) {
                for (let y = yRange[0]; y <= yRange[1]; y++) {
                    const yPos = yOffset - y * yScale;
                    svg += `<line x1="${margin}" y1="${yPos}" x2="${width-margin}" y2="${yPos}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="0.5"
                        opacity="${this.options.gridOpacity}"/>`;
                }
            }
        }
        
        // 绘制坐标轴
        if (this.options.showAxis) {
            const arrowMarker = this.options.showArrows ? ' marker-end="url(#arrowhead)"' : '';
            
            // x轴
            if (this.options.showXAxis) {
                const yAxisPos = yOffset;
                svg += `<line x1="${margin}" y1="${yAxisPos}" x2="${width-margin}" y2="${yAxisPos}" 
                    stroke="${this.options.axisColor}" 
                    stroke-width="${this.options.axisWidth}"${arrowMarker}/>`;
                
                // x轴标签
                if (this.options.showLabels) {
                    svg += `<text x="${width-margin+10}" y="${yAxisPos+20}" 
                        style="font-family: serif; font-style: italic; font-size: ${this.options.labelSize}px; fill: ${this.options.labelColor}"
                        >${this.options.xLabel}</text>`;
                }
            }
            
            // y轴
            if (this.options.showYAxis) {
                const xAxisPos = xOffset;
                svg += `<line x1="${xAxisPos}" y1="${height-margin}" x2="${xAxisPos}" y2="${margin}" 
                    stroke="${this.options.axisColor}" 
                    stroke-width="${this.options.axisWidth}"${arrowMarker}/>`;
                
                // y轴标签
                if (this.options.showLabels) {
                    svg += `<text x="${xAxisPos-20}" y="${margin-10}" 
                        style="font-family: serif; font-style: italic; font-size: ${this.options.labelSize}px; fill: ${this.options.labelColor}"
                        >${this.options.yLabel}</text>`;
                }
            }
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
                // 计算直线中点位置，但稍微向右上方偏移
                const { xRange } = this.options;
                const midX = (xRange[0] + xRange[1]) * 0.6;  // 偏向右侧
                const midY = eq.slope * midX + eq.yIntercept;
                
                // 转换为 SVG 坐标
                const labelX = midX * xScale + xOffset;
                const labelY = yOffset - midY * yScale;

                // 使用配置的偏移量或默认值
                const offsetX = eq.labelOffsetX ?? 15;
                const offsetY = eq.labelOffsetY ?? -15;
                
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

                // 添加方程标签，使用白色背景确保可读性
                svg += `
                    <rect x="${labelX + offsetX - 2}" y="${labelY + offsetY - 12}" 
                        width="${equationText.length * 8}" height="16" 
                        fill="white" fill-opacity="0.8"/>
                    <text x="${labelX + offsetX}" y="${labelY + offsetY}" 
                        style="font-family: serif; font-style: italic; font-size: 14px; fill: ${eq.color}"
                        >${equationText}</text>
                `;
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
                // 使用配置的偏移量或默认值
                const labelX = xPos + (point.labelOffsetX ?? 10);
                const labelY = yPos + (point.labelOffsetY ?? -10);
                svg += `<text x="${labelX}" y="${labelY}" 
                    style="font-family: serif; font-size: 14px">${point.label}</text>`;
            }
        }
        
        // 绘制函数曲线
        for (const func of this.functions) {
            const { xRange } = this.options;
            const dx = (xRange[1] - xRange[0]) / 100;  // 将区间分成100份
            let pathD = '';
            let firstPoint = true;

            // 生成路径数据
            for (let x = xRange[0]; x <= xRange[1]; x += dx) {
                try {
                    const y = func.fn(x);
                    if (isFinite(y) && !isNaN(y)) {  // 检查 y 值是否有效
                        const xPos = x * xScale + xOffset;
                        const yPos = yOffset - y * yScale;
                        pathD += firstPoint ? `M ${xPos},${yPos}` : ` L ${xPos},${yPos}`;
                        firstPoint = false;
                    }
                } catch (e) {
                    // 忽略计算错误，继续下一个点
                    continue;
                }
            }

            // 绘制曲线
            if (pathD) {
                svg += `<path d="${pathD}" fill="none" stroke="${func.color}" 
                    stroke-width="2" stroke-dasharray="${func.style === 'dotted' ? '4,4' : ''}"/>`;
            }

            // 如果需要显示方程
            if (func.showEquation) {
                // 找一个合适的位置显示方程（在曲线中间位置）
                const midX = (xRange[0] + xRange[1]) * 0.6;
                const midY = func.fn(midX);
                
                const labelX = midX * xScale + xOffset + (func.labelOffsetX ?? 15);
                const labelY = yOffset - midY * yScale + (func.labelOffsetY ?? -15);
                
                const equationText = func.equation || 'y = f(x)';

                // 添加方程标签，使用白色背景确保可读性
                svg += `
                    <rect x="${labelX - 2}" y="${labelY - 12}" 
                        width="${equationText.length * 8}" height="16" 
                        fill="white" fill-opacity="0.8"/>
                    <text x="${labelX}" y="${labelY}" 
                        style="font-family: serif; font-style: italic; font-size: 14px; fill: ${func.color}"
                        >${equationText}</text>
                `;
            }
        }
        
        // 绘制圆
        for (const circle of this.circles) {
            const centerXPos = circle.centerX * xScale + xOffset;
            const centerYPos = yOffset - circle.centerY * yScale;
            const radiusX = circle.radius * xScale;
            const radiusY = circle.radius * yScale;

            // 绘制圆
            svg += `<ellipse cx="${centerXPos}" cy="${centerYPos}" 
                rx="${radiusX}" ry="${radiusY}"
                fill="none"
                stroke="${circle.color}" 
                stroke-width="2"
                stroke-dasharray="${circle.style === 'dotted' ? '4,4' : ''}"/>`;

            // 如果需要显示方程
            if (circle.showEquation) {
                const labelX = centerXPos + (circle.labelOffsetX ?? 15);
                const labelY = centerYPos + (circle.labelOffsetY ?? -15);
                
                const equationText = circle.equation || 
                    `(x${circle.centerX >= 0 ? '-' : '+'}${Math.abs(circle.centerX)})² + ` +
                    `(y${circle.centerY >= 0 ? '-' : '+'}${Math.abs(circle.centerY)})² = ${circle.radius * circle.radius}`;

                // 添加方程标签，使用白色背景确保可读性
                svg += `
                    <rect x="${labelX - 2}" y="${labelY - 12}" 
                        width="${equationText.length * 8}" height="16" 
                        fill="white" fill-opacity="0.8"/>
                    <text x="${labelX}" y="${labelY}" 
                        style="font-family: serif; font-style: italic; font-size: 14px; fill: ${circle.color}"
                        >${equationText}</text>
                `;
            }
        }
        
        svg += '</svg>';
        
        return svg;
    }
} 