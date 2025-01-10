export class FractionUtils {
    /**
     * 约简分数
     * @param numerator 分子
     * @param denominator 分母
     * @returns [约简后的分子, 约简后的分母]
     */
    static simplify(numerator: number, denominator: number): [number, number] {
        // 处理负数
        const sign = (numerator < 0) !== (denominator < 0) ? -1 : 1;
        numerator = Math.abs(numerator);
        denominator = Math.abs(denominator);

        // 计算最大公约数并约简
        const gcd = this.findGCD(numerator, denominator);
        return [sign * (numerator / gcd), denominator / gcd];
    }

    /**
     * 计算最大公约数
     */
    private static findGCD(a: number, b: number): number {
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    /**
     * 将分数转换为 LaTeX 格式
     */
    static toLatex(numerator: number, denominator: number): string {
        if (denominator === 1) return numerator.toString();
        return `\\frac{${numerator}}{${denominator}}`;
    }

    /**
     * 分数乘法
     */
    static multiply(
        [num1, den1]: [number, number], 
        [num2, den2]: [number, number]
    ): [number, number] {
        return this.simplify(num1 * num2, den1 * den2);
    }

    /**
     * 分数除法
     */
    static divide(
        [num1, den1]: [number, number], 
        [num2, den2]: [number, number]
    ): [number, number] {
        return this.simplify(num1 * den2, den1 * num2);
    }
} 