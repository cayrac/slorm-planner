import { CraftableEffect } from './craftable-effect';
import { EffectValueConstant } from './effect-value';
import { Rarity } from './enum/rarity';

export interface Affix {
    primaryNameType: string;
    rarity: Rarity;
    pure: number;
    itemLevel: number;
    reinforcment: number;
    locked: boolean;
    minLevel: number;

    craftedEffect: CraftableEffect<EffectValueConstant>;

    isPure: boolean;
    valueLabel: string;
    statLabel: string;
}