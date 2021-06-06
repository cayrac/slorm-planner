import { HeroesData } from '../model/heroes-data';
import { Item } from '../model/item';
import { Weapon } from '../model/weapon';

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

export function toHeroes<T>(data: [T, T, T]): HeroesData<T> {
    return {
        warrior: data[0],
        hunter: data[1],
        mage: data[2]
    }
}

export function toItem(data: string): Item | null {
    return data === '0' ? null : data;
}

export function toWeapon(data: string): Weapon {
    const [basic, primordial] = data.split('/', 2);
    return {
        basic: basic.split(':').map(strictParseInt),
        primordial: primordial.split(':').map(strictParseInt)
    }
}

export function toNumberArray(data: string): Array<number> {
    return data.split(',').map(v => strictParseInt(v));
}

export function strictParseInt(data: string): number {
    const value = parseInt(data, 10);
    if (data !== value.toString()) {
        throw new Error('Int parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}

export function strictParseFloat(data: string): number {
    const value = parseFloat(data);
    if (data !== value.toString()) {
        throw new Error('Int parse error : expected "' + data + '" but got "' + value + '"');
    }
    return value;
}