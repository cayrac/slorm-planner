import { EffectValueType } from './enum/effect-value-type';
import { EffectValueUpgradeType } from './enum/effect-value-upgrade-type';
import { EffectValueValueType } from './enum/effect-value-value-type';

export interface AbstractEffectValue {
    type: EffectValueType;
    valueType: EffectValueValueType;
    stat: string | null;
    percent: boolean;
    value: number;
    max?: number;
};

export interface EffectValueVariable extends AbstractEffectValue {
    type: EffectValueType.Variable;
    upgrade: number;
    maxUpgrade?: number;
    upgradeType: EffectValueUpgradeType;
}

export interface EffectValueConstant extends AbstractEffectValue {
    type: EffectValueType.Constant;
}

export interface EffectValueSynergy extends AbstractEffectValue {
    type: EffectValueType.Synergy;
    upgrade: number;
    maxUpgrade?: number;
    upgradeType: EffectValueUpgradeType;
    source: string;
    synergy: number;
}