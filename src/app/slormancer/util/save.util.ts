import { GameHeroesData, GameWeapon } from '../model/game/game-save';

export function splitHeroesData(data: string): [string, string, string]  {
    const result = data.split('|');
    if (result.length !== 3) {
        throw new Error('Split hero data failed : expected "' + data + '" to have 3 values separated by |, but got ' + result.length);
    }
    return <[string, string, string]>result;
}

export function mapHeroesArray<T, U>(data: [T, T, T], map: (value: T) => U): [U, U, U]  {
    return [
        map(data[0]),
        map(data[1]),
        map(data[2])
    ]
}

export function toHeroes<T>(data: [T, T, T]): GameHeroesData<T> {
    return {
        warrior: data[0],
        huntress: data[1],
        mage: data[2]
    }
}

export function toWeapon(data: string): GameWeapon {
    const [basic, primordial] = data.split('/', 2);
    return {
        basic: basic.split(':').map(strictParseInt),
        primordial: primordial.split(':').map(strictParseInt)
    }
}

export function strictSplit(data: string, separator = ',', expected: number | null = null): Array<string> {
    const array = data.split(separator);

    if (expected !== null && array.length !== expected) {
        throw new Error('Strict split error : expected "' + data + '" splitted with "' + separator + '" to have ' + expected + ' values, but got ' + array.length);
    }

    return array;
}

export function toNumberArray(data: string, separator = ',', expected: number | null = null): Array<number> {
    return strictSplit(data, separator, expected).map(strictParseInt);
}

export function strictParseInt(data: string): number {
    data = data.replace(/^0*(.+?)$/, '$1');
    const value = parseInt(data, 10);
    if (data !== value.toString()) {
        throw new Error('Int parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}

export function strictParseFloat(data: string): number {
    data = data.replace(/^0*(.+?)0*$/, '$1');
    const value = parseFloat(data);
    if (data !== value.toString()) {
        throw new Error('Int parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}

export function valueOrNull<T>(value: T | null | undefined): T | null {
    return value === null || value === undefined ? null : value;
}