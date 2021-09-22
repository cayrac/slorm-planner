import { MinMax } from '../minmax';
import { EffectValueType } from './enum/effect-value-type';
import { EffectValueUpgradeType } from './enum/effect-value-upgrade-type';
import { EffectValueValueType } from './enum/effect-value-value-type';

export interface AbstractEffectValue {
    type: EffectValueType;
    valueType: EffectValueValueType;
    stat: string;
    percent: boolean;
    value: number;
    displayValue: number;
    max?: number;
};

export interface EffectValueVariable extends AbstractEffectValue {
    type: EffectValueType.Variable;
    baseValue: number;
    upgrade: number;
    upgradeType: EffectValueUpgradeType;
}

export interface EffectValueConstant extends AbstractEffectValue {
    type: EffectValueType.Constant;
}

export interface EffectValueSynergy extends AbstractEffectValue {
    type: EffectValueType.Synergy;
    baseValue: number;
    upgrade: number;
    upgradeType: EffectValueUpgradeType;
    source: string;
    synergy: number | MinMax;
}

export interface EffectValueComplexSynergy extends AbstractEffectValue {
    type: EffectValueType.ComplexSynergy;
    sources: Array<string>;
    method: (...values: Array<number | MinMax>) => number | MinMax;
    synergy: number | MinMax;
}