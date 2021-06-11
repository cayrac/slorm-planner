export declare type Item = RessourceItem | EquippableItem;

export interface RessourceItem {
    quantity: number;
    quality: number;
    type: string;
}

export interface EquippableItem {
    generic_1: number;
    slot: number;
    level: number;
    reinforcment: number;
    rarity: number;
    generic_4: number;
    generic_5: number;
    potential: number;
    affixes: Array<Affixe>;
    enchantments: Array<Enchantment>;
}

export declare type AffixeRarity = 'N' | 'M' | 'R' | 'E' | 'L';

export declare type EnchantmentTarget = 'MA' | 'AT' | 'RP';

export interface Affixe {
    rarity: AffixeRarity;
    type: number;
    value: number;
    locked: boolean;
}

export interface Enchantment {
    target: EnchantmentTarget;
    type: number;
    value: number;
}