import { MinMax } from '../minmax';
import { EffectValueType } from './enum/effect-value-type';
import { EffectValueUpgradeType } from './enum/effect-value-upgrade-type';
import { EffectValueValueType } from './enum/effect-value-value-type';

export interface AbstractEffectValue {
    type: EffectValueType;
    valueType: EffectValueValueType;
    stat: string;
    percent: boolean;
    baseValue: number;
    value: number;
    displayValue: number;
    max?: number;
};

export interface EffectValueVariable extends AbstractEffectValue {
    type: EffectValueType.Variable;
    upgrade: number;
    upgradedValue: number;
    upgradeType: EffectValueUpgradeType;
}

export interface EffectValueConstant extends AbstractEffectValue {
    type: EffectValueType.Constant;
}

export interface EffectValueSynergy extends AbstractEffectValue {
    type: EffectValueType.Synergy;
    upgrade: number;
    upgradeType: EffectValueUpgradeType;
    source: string;
    precision: number | null;
    allowMinMax: boolean;
    baseSynergy: number | MinMax;
    synergy: number | MinMax;
    displaySynergy: number | MinMax;
}