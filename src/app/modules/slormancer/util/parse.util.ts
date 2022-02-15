import { MinMax } from '../model/minmax';
import { GameHeroesData, GameWeapon } from '../model/parser/game/game-save';

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
        0: data[0],
        1: data[1],
        2: data[2]
    }
}

export function toWeapon(data: string, id: number): GameWeapon {
    const [basic, primordial] = strictSplit(data, '/', 2);
    const basicData = toFloatArray(<string>basic, ':', 4);
    const primordialData = toFloatArray(<string>primordial, ':', 4);
    return {
        id,
        basic: { obtained: basicData[0] === 1, experience: <number>basicData[1], kills: <number>basicData[2], generic4: <number>basicData[3] },
        primordial: { obtained: primordialData[0] === 1, experience: <number>primordialData[1], kills: <number>primordialData[2], generic4: <number>primordialData[3] }
    }
}

export function strictSplit(data: string, separator = ',', expected: number | MinMax | null = null): Array<string> {
    const array = data.split(separator);

    if (expected !== null) {
        if (typeof expected === "number") {
            if (array.length !== expected) {
                throw new Error('Strict split error : expected "' + data + '" splitted with "' + separator + '" to have ' + expected + ' values, but got ' + array.length);
            }
        } else if (array.length < expected.min || array.length > expected.max) {
            throw new Error('Strict split error : expected "' + data + '" splitted with "' + separator + '" to have between ' + expected.min + ' and ' + expected.max + ' values, but got ' + array.length);
        }

    }

    return array;
}

export function toNumberArray(data: string, separator = ',', expected: number | null = null): Array<number> {
    return strictSplit(data, separator, expected).map(strictParseInt);
}
export function toFloatArray(data: string, separator = ',', expected: number | null = null): Array<number> {
    return strictSplit(data, separator, expected).map(strictParseFloat);
}

export function strictParseInt(data: string): number {
    if (data.length > 10) {
        console.log('strict parse int : ', data);
    }

    data = data.replace(/^0*([0-9]+.+?)$/, '$1');
    let value = parseInt(data, 10);

    if (value > Number.MAX_SAFE_INTEGER) {
        value = Number.MAX_SAFE_INTEGER;
    } else if (data !== value.toString()) {
        throw new Error('Int parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}

export function parseIntOrdefault<T>(data: string, defaultValue: T): number | T {
    const result = parseInt(data);
    return isNaN(result) ? defaultValue : result;
}

export function strictParseFloat(data: string): number {
    data = data.replace(/^0*([0-9]+.+?)0*$/, '$1');
    if (data.endsWith('.')) {
        data = data.slice(0, data.length - 1);
    }
    let value = parseFloat(data);
    if (value > Number.MAX_SAFE_INTEGER) {
        value = Number.MAX_SAFE_INTEGER;
    } if (data !== value.toString()) {
        throw new Error('Float parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}