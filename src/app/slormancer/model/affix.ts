import { EffectValueConstant } from './effect-value';
import { Rarity } from './enum/rarity';

export interface ItemAffix {
    primaryNameType: string;
    rarity: Rarity;
    craftedValue: number;
    possibleCraftedValues: { [key: number]: number },
    minPossibleCraftedValue: number;
    maxPossibleCraftedValue: number;
    pure: number | null;
    itemLevel: number;
    reinforcment: number;
    score: number;
    locked: boolean;

    effect: EffectValueConstant;

    isPure: boolean;
    valueLabel: string;
    statLabel: string;
}