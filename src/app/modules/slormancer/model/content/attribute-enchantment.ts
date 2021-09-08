import { EffectValueVariable } from './effect-value';
import { Attribute } from './enum/attribute';


export interface AttributeEnchantment {
    craftedAttribute: Attribute;
    craftableValues: { [key: number] : number },
    craftedValue: number;

    effect: EffectValueVariable;

    label: string;
    icon: string;
}