import { ItemRarity } from '../constants/item-rarity';

export interface ExtendedAffix {
    rarity: ItemRarity;
    name: string;
    values: { [key: number]: number },
    min: number;
    value: number;
    max: number;
    percent: boolean;
    suffix: string
}