import { ItemRarity } from '../constants/item-rarity';

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

export function compareRarities(a: ItemRarity, b: ItemRarity): number {
    let numA = 1;
    let numB = 1;

    if (a === ItemRarity.Legendary) numA = 5;
    if (a === ItemRarity.Epic) numA = 4;
    if (a === ItemRarity.Rare) numA = 3;
    if (a === ItemRarity.Magic) numA = 2;
    if (b === ItemRarity.Legendary) numB = 5;
    if (b === ItemRarity.Epic) numB = 4;
    if (b === ItemRarity.Rare) numB = 3;
    if (b === ItemRarity.Magic) numB = 2;

    return numA < numB ? -1 : numA > numB ? 1 : 0;
}