import { EffectValueVariable } from './effect-value';

export interface AttributeEnchantment {
    craftedAttribute: number;
    craftableValues: { [key: number] : number },
    craftedValue: number;

    effect: EffectValueVariable;

    label: string;
    icon: string;
}