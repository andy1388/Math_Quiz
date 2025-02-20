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
    showAllGrids?: boolean;  // 新增選項
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
    domain?: [number, number];    // 定义域限制 [min, max]
    range?: [number, number];     // 值域限制 [min, max]
}

interface LinearConstraint {
    slope: number | ((x: number) => number);  // 可以是斜率或函數
    yIntercept: number;
    isGreaterThan: boolean;
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface Point {
    x: number;
    y: number;
    symbol: string;
    label?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
    color?: string;  // 添加可選的顏色屬性
}

// 添加新的接口来定义解释坐标系的配置
interface ExplanationSystemConfig {
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    point: { x: number; y: number };
    showXAxis?: boolean;
    showYAxis?: boolean;
    showGrid?: boolean;
    showAllGrids?: boolean;
    axisLabels?: number[];
    labelOffset?: { x: number; y: number };
    isXAxisOnly?: boolean;   // 是否只显示x轴
    isYAxisOnly?: boolean;   // 是否只显示y轴
    showAxisNumbers?: boolean; // 新增：是否显示坐标轴上的数字
    showGridLines?: boolean;   // 新增：是否显示网格线
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: Point[] = [];
    private lines: { from: [number, number]; to: [number, number]; color: string; style?: string }[] = [];
    private verticalLines: { x: number; color: string; style?: string }[] = [];
    private equations: LineEquation[] = [];
    private functions: FunctionEquation[] = [];  // 新增：函数数组
    private circles: CircleEquation[] = [];  // 新增：圆形数组
    private constraints: LinearConstraint[] = [];  // 新增：线性约束数组
    private axisLabels: {
        x: number[];
        y: number[];
    } = {
        x: [],
        y: []
    };
    private texts: { x: number; y: number; text: string; color: string; fontSize?: number; hasBackground?: boolean }[] = [];

    constructor(options: CoordinateSystemOptions) {
        // 設置默認值
        this.options = {
            ...options,
            // 保持原始範圍，不需要擴展
            showGrid: options.showGrid ?? true,
            gridColor: options.gridColor ?? '#e0e0e0',  // 改為更深的灰色
            gridOpacity: options.gridOpacity ?? 0.8,    // 提高不透明度
            showHorizontalGrid: options.showHorizontalGrid ?? true,
            showVerticalGrid: options.showVerticalGrid ?? true,
            
            // 其他設置保持不變
            showAxis: options.showAxis ?? true,
            axisColor: options.axisColor ?? 'black',
            axisWidth: options.axisWidth ?? 1,
            showXAxis: options.showXAxis ?? true,
            showYAxis: options.showYAxis ?? true,
            showArrows: options.showArrows ?? true,
            
            showLabels: options.showLabels ?? true,
            xLabel: options.xLabel ?? 'x',
            yLabel: options.yLabel ?? 'y',
            labelColor: options.labelColor ?? 'black',
            labelSize: options.labelSize ?? 16
        };
    }

    addPoint(x: number, y: number, symbol: string = "●", label?: string, labelOffsetX: number = 10, labelOffsetY: number = -10, color: string = "black") {
        this.points.push({ 
            x, 
            y, 
            symbol, 
            label, 
            labelOffsetX, 
            labelOffsetY, 
            color
        });
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
        labelOffsetY: number = -15,
        domain?: [number, number],
        range?: [number, number]
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
            labelOffsetY,
            domain,
            range
        });
    }

    addLinearConstraint(
        slope: number | ((x: number) => number),  // 可以是斜率或函數
        yIntercept: number,
        isGreaterThan: boolean = true,
        color: string = "red",
        style: string = "solid",
        showEquation: boolean = false,
        equation?: string,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15
    ) {
        this.constraints.push({
            slope,
            yIntercept,
            isGreaterThan,
            color,
            style,
            showEquation,
            equation,
            labelOffsetX,
            labelOffsetY
        });
    }

    addHorizontalLine(
        y: number,
        color: string = "black",
        style: string = "solid"
    ) {
        const { xRange } = this.options;
        
        // 添加水平線段
        this.lines.push({
            from: [xRange[0], y],  // 從左邊界開始
            to: [xRange[1], y],    // 到右邊界結束
            color,
            style
        });
    }

    addLineSegment(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string = "black",
        style: string = "solid"
    ) {
        // 添加線段
        this.lines.push({
            from: [x1, y1],
            to: [x2, y2],
            color,
            style
        });
    }

    addAxisLabels(
        xLabels: number[],
        yLabels: number[]
    ) {
        this.axisLabels.x = xLabels;
        this.axisLabels.y = yLabels;
    }

    addText(
        x: number,
        y: number,
        text: string,
        color: string = "black"
    ) {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 計算實際位置
        const xPos = x * xScale + xOffset;
        const yPos = yOffset - y * yScale;

        this.texts.push({
            x: xPos,
            y: yPos,
            text,
            color
        });
    }

    // 新增方法：添加帶背景的文字標籤
    addTextWithBackground(
        x: number,
        y: number,
        text: string,
        color: string = "black",
        fontSize: number = 16  // 默認大小
    ) {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 計算實際位置
        const xPos = x * xScale + xOffset;
        const yPos = yOffset - y * yScale;

        // 添加背景矩形和文字
        this.texts.push({
            x: xPos,
            y: yPos,
            text,
            color,
            fontSize,
            hasBackground: true  // 新增屬性
        });
    }

    toString(): string {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
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
        
        // 繪製網格
        if (this.options.showGrid) {
            // 垂直網格線
            if (this.options.showVerticalGrid) {
                const gridStart = this.options.showAllGrids ? xRange[0] : Math.max(0, xRange[0]);
                const gridEnd = this.options.showAllGrids ? xRange[1] : Math.min(5, xRange[1]);
                
                for (let x = gridStart; x <= gridEnd; x++) {
                    const xPos = x * xScale + xOffset;
                    svg += `<line x1="${xPos}" y1="${margin}" x2="${xPos}" y2="${height-margin}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="1"
                        opacity="${this.options.gridOpacity}"/>`;
                }
            }

            // 水平網格線
            if (this.options.showHorizontalGrid) {
                const gridStart = this.options.showAllGrids ? yRange[0] : Math.max(0, yRange[0]);
                const gridEnd = this.options.showAllGrids ? yRange[1] : Math.min(5, yRange[1]);
                
                for (let y = gridStart; y <= gridEnd; y++) {
                    const yPos = yOffset - y * yScale;
                    svg += `<line x1="${margin}" y1="${yPos}" x2="${width-margin}" y2="${yPos}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="1"
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
                    const fontSize = (this.options.labelSize ?? 16) * 1.5;  // 添加默認值
                    svg += `<text x="${width-margin+5}" y="${yOffset+5}" 
                        style="font-family: serif; font-style: italic; font-size: ${fontSize}px; fill: ${this.options.labelColor}"
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
                    const fontSize = (this.options.labelSize ?? 16) * 1.5;  // 添加默認值
                    svg += `<text x="${xOffset-5}" y="${margin-5}" 
                        style="font-family: serif; font-style: italic; font-size: ${fontSize}px; fill: ${this.options.labelColor}"
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
        
        // 繪製所有線段
        for (const line of this.lines) {
            const [x1, y1] = line.from;
            const [x2, y2] = line.to;
            svg += `<line 
                x1="${x1 * xScale + xOffset}" 
                y1="${yOffset - y1 * yScale}" 
                x2="${x2 * xScale + xOffset}" 
                y2="${yOffset - y2 * yScale}"
                stroke="${line.color}"
                stroke-width="2"
                stroke-dasharray="${line.style === 'dotted' ? '4,4' : ''}"
            />`;
        }

        // 繪製所有點和標籤
        for (const point of this.points) {
            const x = point.x * xScale + xOffset;
            const y = yOffset - point.y * yScale;
            
            // 繪製點
            svg += `<text x="${x}" y="${y}" 
                text-anchor="middle" 
                dominant-baseline="middle"
                fill="${point.color || 'black'}"
                style="font-size: 20px;"
            >${point.symbol}</text>`;
            
            // 繪製標籤
            if (point.label) {
                svg += `<text 
                    x="${x + (point.labelOffsetX ?? 10)}" 
                    y="${y + (point.labelOffsetY ?? -10)}"
                    fill="${point.color || 'black'}"
                    style="font-size: ${this.options.labelSize}px;"
                >${point.label}</text>`;
            }
        }

        // 繪製座標軸標籤
        for (const x of this.axisLabels.x) {
            const xPos = x * xScale + xOffset;
            svg += `<text 
                x="${xPos}" 
                y="${yOffset + 20}" 
                text-anchor="middle"
                style="font-size: ${this.options.labelSize}px;"
            >${x}</text>`;
        }

        for (const y of this.axisLabels.y) {
            const yPos = yOffset - y * yScale;
            svg += `<text 
                x="${xOffset - 10}" 
                y="${yPos}" 
                text-anchor="end"
                dominant-baseline="middle"
                style="font-size: ${this.options.labelSize}px;"
            >${y}</text>`;
        }

        // 繪製額外的文字標籤
        for (const text of this.texts) {
            if (text.hasBackground) {
                // 先繪製白色背景
                svg += `<rect 
                    x="${text.x - 12}" 
                    y="${text.y - 12}" 
                    width="24" 
                    height="24" 
                    fill="white"
                    rx="4"
                />`;
            }
            
            // 繪製文字
            svg += `<text 
                x="${text.x}" 
                y="${text.y}" 
                text-anchor="middle"
                dominant-baseline="middle"
                fill="${text.color}"
                style="font-size: ${text.fontSize ?? this.options.labelSize}px; font-weight: bold;"
            >${text.text}</text>`;
        }

        svg += '</svg>';
        return svg;
    }

    static createExplanationSystem(config: ExplanationSystemConfig): CoordinateSystem {
        const {
            width,
            height,
            xRange,
            yRange,
            point,
            showXAxis = true,
            showYAxis = true,
            showGrid = true,
            showAllGrids = true,
            axisLabels = [],
            labelOffset = { x: 15, y: -20 },
            isXAxisOnly = false,
            isYAxisOnly = false,
            showAxisNumbers = true,  // 默认显示数字
            showGridLines = true     // 默认显示网格
        } = config;

        // 根据是否只显示单轴调整配置
        const adjustedConfig: CoordinateSystemOptions = {
            width: isYAxisOnly ? 200 : width,
            height: isXAxisOnly ? 200 : height,
            xRange: isYAxisOnly ? [-1, 1] as [number, number] : xRange,
            yRange: isXAxisOnly ? [-1, 1] as [number, number] : yRange,
            showGrid: showGridLines && !isXAxisOnly && !isYAxisOnly,  // 只在完整坐标系中显示网格
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showXAxis: !isYAxisOnly,
            showYAxis: !isXAxisOnly,
            showAllGrids
        };

        const system = new CoordinateSystem(adjustedConfig);

        // 添加坐标轴标签
        if (showAxisNumbers && axisLabels.length > 0) {
            system.addAxisLabels(
                !isYAxisOnly ? axisLabels : [], 
                !isXAxisOnly ? axisLabels : []
            );
        }

        // 添加刻度线
        if (!isYAxisOnly) {  // x轴刻度线
            for (let x = Math.floor(xRange[0]); x <= Math.ceil(xRange[1]); x++) {
                if (x !== Math.ceil(xRange[1])) {
                    system.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                }
            }
        }
        if (!isXAxisOnly) {  // y轴刻度线
            for (let y = Math.floor(yRange[0]); y <= Math.ceil(yRange[1]); y++) {
                if (y !== Math.ceil(yRange[1])) {
                    system.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                }
            }
        }

        return system;
    }

    // 修改函数签名，只接受四个参数
    addCoordinateLocatingGuides(
        point: { x: number; y: number }, 
        step: 1 | 2, 
        showXGuide = true, 
        showYGuide = true
    ): void {
        if (showXGuide && !showYGuide) {
            // 只显示x轴的情况
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
            return;
        }

        if (showYGuide && !showXGuide) {
            // 只显示y轴的情况
            if (point.y !== 0) {
                this.addLineSegment(0, 0, 0, point.y, "blue", "solid");
                const arrowSize = 0.2;
                if (point.y > 0) {
                    this.addLineSegment(0, point.y, arrowSize, point.y - arrowSize, "blue", "solid");
                    this.addLineSegment(0, point.y, -arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    this.addLineSegment(0, point.y, arrowSize, point.y + arrowSize, "blue", "solid");
                    this.addLineSegment(0, point.y, -arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }
            this.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 24);
            return;
        }

        // 完整坐标系的处理逻辑
        if (step === 1) {
            // 添加垂直辅助线（绿色虚线）
            this.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
            
            // 添加x轴红色线段和箭头
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            
            // 添加x坐标标签
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
        } else {
            // 添加水平辅助线（绿色虚线）
            this.addLineSegment(0, point.y, point.x, point.y, "green", "dotted");
            
            // 保留第一步的红色线段和箭头
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            
            // 添加y轴蓝色线段和箭头
            if (point.y !== 0) {
                this.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
                const arrowSize = 0.2;
                if (point.y > 0) {
                    this.addLineSegment(point.x, point.y, point.x + arrowSize, point.y - arrowSize, "blue", "solid");
                    this.addLineSegment(point.x, point.y, point.x - arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    this.addLineSegment(point.x, point.y, point.x + arrowSize, point.y + arrowSize, "blue", "solid");
                    this.addLineSegment(point.x, point.y, point.x - arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }
            
            // 添加坐标标签
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
            this.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 24);
        }
    }
}