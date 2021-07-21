import { EffectValueType } from './enum/effect-value-type';
import { EffectValueUpgradeType } from './enum/effect-value-upgrade-type';
import { EffectValueValueType } from './enum/effect-value-value-type';

export interface AbstractEffectValue {
    type: EffectValueType;
    valueType: EffectValueValueType;
    stat: string | null;
};

export interface EffectValueVariable extends AbstractEffectValue {
    type: EffectValueType.Variable;
    value: number;
    upgrade: number;
    upgradeType: EffectValueUpgradeType;
    percent: boolean;
    range: boolean;
}

export interface EffectValueConstant extends AbstractEffectValue {
    type: EffectValueType.Constant;
    value: number;
    percent: boolean;
}

export interface EffectValueSynergy extends AbstractEffectValue {
    type: EffectValueType.Synergy;
    ratio: number;
    upgrade: number;
    upgradeType: EffectValueUpgradeType;
    source: string;
    range: boolean;
}