import { Rarity } from './enum/rarity';

export interface Affix {
    rarity: Rarity;
    name: string;
    values: { [key: number]: number },
    min: number;
    value: number;
    max: number;
    percent: boolean;
    suffix: string;
    locked: boolean;
    pure: number | null
}