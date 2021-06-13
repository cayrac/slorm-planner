

    export function bankerRound(value: number): number {
        var r = Math.round(value);
        return (((((value>0)?value:(-value))%1)===0.5)?(((0===(r%2)))?r:(r-1)):r);
    }

    export function list(min: number, max: number): Array<number> {
        return Array.from(new Array(max - min + 1).keys()).map(v => min + v);
    }