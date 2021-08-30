import { EffectValueVariable } from './effect-value';

export interface SkillEnchantment {
    craftedSkill: number;
    craftableValues: { [key: number] : number },
    craftedValue: number;

    effect: EffectValueVariable;

    label: string;
    icon: string;
}