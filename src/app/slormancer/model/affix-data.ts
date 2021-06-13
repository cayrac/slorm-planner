import { ItemRarity } from '../constants/item-rarity';

export interface AffixData {
    rarity: ItemRarity;
    name: string;
    values: { [key: number]: number },
    min: number;
    value: number;
    max: number;
    percent: boolean;
    prefix: string;
    suffix: string
}