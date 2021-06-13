import { GameEnchantmentTarget } from '../../constants/game/game-enchantment-target';
import { GameRarity } from '../../constants/game/game-rarity';

export declare type GameItem = GameRessourceItem | GameEquippableItem;

export interface GameRessourceItem {
    quantity: number;
    quality: number;
    type: string;
}

export interface GameEquippableItem {
    generic_1: number;
    slot: number;
    level: number;
    reinforcment: number;
    rarity: number;
    generic_4: number;
    generic_5: number;
    potential: number;
    affixes: Array<GameAffixe>;
    enchantments: Array<GameEnchantment>;
}

export interface GameAffixe {
    rarity: GameRarity;
    type: number;
    value: number;
    locked: boolean;
}

export interface GameEnchantment {
    target: GameEnchantmentTarget;
    type: number;
    value: number;
}