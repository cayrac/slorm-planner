

    export function bankerRound(value: number): number {
        var r = Math.round(value);
        return (((((value>0)?value:(-value))%1)===0.5)?(((0===(r%2)))?r:(r-1)):r);
    }

    export function round(value: number, decimals: number = 0): number {
        const decal = Math.pow(10, decimals);
        return Math.round(value * decal) / decal;
    }

    /**
     * 
     * @param min 
     * @param max 
     * @returns list(min, max) or list(0, min - 1) if max is not given
     */
    export function list(min: number, max: number | null = null): Array<number> {
        if (max === null) {
            max = min - 1;
            min = 0;
        }
        return Array.from(new Array(max - min + 1).keys()).map(v => min + v);
    }