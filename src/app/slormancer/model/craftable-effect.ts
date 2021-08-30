import { AbstractEffectValue } from './effect-value';

export interface CraftableEffect<T extends AbstractEffectValue = AbstractEffectValue> {
    score: number;
    craftedValue: number;
    possibleCraftedValues: { [key: number]: number };
    minPossibleCraftedValue: number;
    maxPossibleCraftedValue: number;
    effect: T;
}