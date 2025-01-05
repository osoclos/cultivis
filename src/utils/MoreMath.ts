export class MoreMath {
    static isInRange(val: number, min: number, max: number): boolean {
        return min <= val && val <= max;
    }

    static clamp(val: number, min: number, max: number): number {
        return this.isInRange(val, min, max) ? val : Math.max(min, Math.min(val, max));
    }

    static round(val: number, decimalPoints: number = 0): number {
        return this.roundNearest(val, 0.1 ** decimalPoints);
    }

    static roundNearest(val: number, nearest: number = 1): number {
        return Math.round(val / nearest) * nearest;
    }

    static floorNearest(val: number, nearest: number = 1): number {
        return Math.floor(val / nearest) * nearest;
    }

    static ceilNearest(val: number, nearest: number = 1): number {
        return Math.ceil(val / nearest) * nearest;
    }

    static gcd(...vals: number[]): number {
        let temp: number;
        const gcd = vals.reduce((a, b) => {
            while (b != 0) {
                temp = b;
    
                b = a % b;
                a = temp;
            }
    
            return a;
        });

        return gcd;
    }

    static lcm(...vals: number[]): number {
        return vals.reduce((a, b) => a * b / this.gcd(a, b));
    }

    static degToRad(deg: number): number {
        return deg / 180 * Math.PI;
    }

    static radToDeg(rad: number): number {
        return rad / this.degToRad(1);
    }
}