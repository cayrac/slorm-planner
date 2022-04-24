import { MinMax } from '../model/minmax';
import { valueOrDefault } from './utils';

export function bankerRound(value: number, decimals: number = 0): number {
    const decal = valueOrDefault(POW_10[decimals], 1);
    const valueToRound = round(value * decal, 3);
    var r = Math.round(valueToRound);
    return ( ( ( ( (valueToRound > 0) ? valueToRound : -valueToRound ) %1 ) === 0.5 ) ? ( ( (0 === (r%2) ) ) ? r : (r-1) ) : r) / decal;
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

export function round<T extends number | MinMax>(value: T, decimals: number = 0): T {
    const decal = valueOrDefault(POW_10[decimals], 1);
    return <T>(typeof value === 'number'
        ? Math.round(value * decal) / decal
        : { min: Math.round((<MinMax>value).min * decal) / decal, max: Math.round((<MinMax>value).max * decal) / decal });
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

export function mult<T extends number |MinMax>(base: T, ...multipliers: Array<number>): T {
    let result: number | MinMax = typeof base === 'number' ? base : { ...base };

    for (const multiplier of multipliers) {
        if (typeof result === 'number') {
            result = result * (100 + multiplier) / 100;
        } else {
            result.min = result.min * (100 + multiplier) / 100;
            result.max = result.max * (100 + multiplier) / 100;
        }
    }

    return <T>result;
}