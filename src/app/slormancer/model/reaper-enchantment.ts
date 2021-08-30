import { EffectValueVariable } from './effect-value';
import { ReaperSmith } from './enum/reaper-smith';

export interface ReaperEnchantment {
    craftedReaperSmith: ReaperSmith;
    craftableValues: { [key: number] : number },
    craftedValue: number;

    effect: EffectValueVariable;

    label: string;
    icon: string;
}