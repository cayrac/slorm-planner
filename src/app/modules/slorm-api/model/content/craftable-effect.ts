import { AbstractEffectValue } from './effect-value';

export interface CraftableEffect<T extends AbstractEffectValue = AbstractEffectValue> {
    score: number;
    craftedValue: number;
    basePossibleCraftedValues: Array<{ craft: number, value: number }>;
    possibleCraftedValues: Array<{ craft: number, value: number }>;
    minPossibleCraftedValue: number;
    maxPossibleCraftedValue: number;
    effect: T;
}