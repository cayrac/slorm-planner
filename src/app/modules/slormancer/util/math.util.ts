import { MinMax } from '../model/minmax';
import { valueOrDefault } from './utils';

export function bankerRound(value: number): number {
    var r = Math.round(value);
    return (((((value>0)?value:(-value))%1)===0.5)?(((0===(r%2)))?r:(r-1)):r);
}

const POW_10: { [key: number]: number} = {
    0: 1,
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
    5: 100000,
    6: 1000000
};
export function round(value: number, decimals: number = 0): number {
    const decal = valueOrDefault(POW_10[decimals], 1);
    return Math.round(value * decal) / decal;
}
export function floor(value: number, decimals: number = 0): number {
    const decal = valueOrDefault(POW_10[decimals], 1);
    return Math.floor(value * decal) / decal;
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

export function add(a: number | MinMax, b: number | MinMax, forceMinMax: boolean = false): number | MinMax {
    let result: number | MinMax;
    const aIsNumber = typeof a === 'number';
    const bIsNumber = typeof b === 'number';

    if (!forceMinMax && aIsNumber && bIsNumber) {
        result = <number>a + <number>b;
    } else {
        result = { min: 0, max: 0 };

        if (aIsNumber) {
            result.min += <number>a;
            result.max += <number>a;
        } else {
            result.min += (<MinMax>a).min;
            result.max += (<MinMax>a).max;
        }
        if (bIsNumber) {
            result.min += <number>b;
            result.max += <number>b;
        } else {
            result.min += (<MinMax>b).min;
            result.max += (<MinMax>b).max;
        }
    }

    return result;
}