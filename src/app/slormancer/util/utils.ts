import { Rarity } from '../model/enum/rarity';

export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function compare(a: string | null, b: string | null): number {
    if (a === null) {
        a = '';
    }    
    if (b === null) {
        b = '';
    }

    return a.localeCompare(b);
}

export function compareRarities(a: Rarity, b: Rarity): number {
    let numA = 1;
    let numB = 1;

    if (a === Rarity.Legendary) numA = 5;
    if (a === Rarity.Epic) numA = 4;
    if (a === Rarity.Rare) numA = 3;
    if (a === Rarity.Magic) numA = 2;
    if (b === Rarity.Legendary) numB = 5;
    if (b === Rarity.Epic) numB = 4;
    if (b === Rarity.Rare) numB = 3;
    if (b === Rarity.Magic) numB = 2;

    return numA < numB ? -1 : numA > numB ? 1 : 0;
}

export function valueOrNull<T>(value: T | null | undefined): T | null {
    return isNotNullOrUndefined(value) ? value : null;
}

export function findFirst(text: string, values: Array<string>): string | null {
    let closest: string | null = null
    let closestPos: number = text.length + 1;

    for (let value of values) {
        const pos = text.indexOf(value);
        if (pos !== -1 && pos < closestPos) {
            closest = value;
            closestPos = pos;
        }
    }

    return closest;
}

export function firstvalue(values: { [key: number]: number }): number | null {
    let value: number | null = null;

    if (values !== null) {
        const keys = Object.keys(values);
        const index = keys[0];

        if (index) {
            value = index ? valueOrNull(values[parseInt(index)]) : null;
        }
    }

    return value;
}

export function lastvalue(values: { [key: number]: number }): number | null {
    let value: number | null = null;

    if (values !== null) {
        const keys = Object.keys(values);
        const index = keys[keys.length - 1];

        if (index) {
            value = index ? valueOrNull(values[parseInt(index)]) : null;
        }
    }

    return value;
}