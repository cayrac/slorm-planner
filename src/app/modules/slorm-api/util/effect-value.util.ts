import { EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/content/effect-value';
import { EffectValueType } from '../model/content/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/content/enum/effect-value-value-type';

export function effectValueConstant(value: number, percent: boolean, stat: string | null = null, valueType: EffectValueValueType = EffectValueValueType.Unknown): EffectValueConstant {
    return {
        type: EffectValueType.Constant,
        valueType,
        stat,
        percent,
        baseValue: value,
        value,
        displayValue: value
    } as EffectValueConstant;
}

export function effectValueVariable(value: number, upgrade: number, upgradeType: EffectValueUpgradeType, percent: boolean, stat: string | null = null, valueType: EffectValueValueType = EffectValueValueType.Unknown, max?: number): EffectValueVariable {
    return {
        type: EffectValueType.Variable,
        valueType,
        stat,
        percent,
        value,
        displayValue: value,
        max,
        baseValue: value,
        baseUpgrade: upgrade,
        upgrade,
        upgradedValue: value,
        upgradeType
    } as EffectValueVariable;
}

export function effectValueSynergy(value: number, upgrade: number, upgradeType: EffectValueUpgradeType, percent: boolean, source: string, stat: string | null = null, valueType: EffectValueValueType = EffectValueValueType.Unknown, max?: number, precision: number | null = null, allowMinMax: boolean = true, detailOnSynergy: boolean = true, showValue = true, cascadeSynergy = false): EffectValueSynergy {
    return {
        type: EffectValueType.Synergy,
        valueType,
        stat,
        percent,
        value,
        displayValue: value,
        max,
        baseValue: value,
        baseUpgrade: upgrade,
        upgrade,
        upgradeType,
        source,
        baseSynergy: 0,
        synergy: 0,
        displaySynergy: 0,
        precision,
        allowMinMax,
        detailOnSynergy,
        showValue,
        cascadeSynergy
    } as EffectValueSynergy
}