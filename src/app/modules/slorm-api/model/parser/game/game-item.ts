import { GameEnchantmentTarget } from './game-enchantment-target';
import { GameRarity } from './game-rarity';

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
    grafts: number;
    potential: number;
    affixes: Array<GameAffix>;
    enchantments: Array<GameEnchantment>;
}

export interface GameAffix {
    rarity: GameRarity;
    type: number;
    value: number;
    locked: boolean;
    pure: number | null;
}

export interface GameEnchantment {
    target: GameEnchantmentTarget;
    type: number;
    value: number;
}