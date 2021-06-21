import { EffectValueType } from './enum/effect-value-type';

export interface AbstractEffectValue {
    type: EffectValueType;
};

export interface EffectValueVariable extends AbstractEffectValue {
    type: EffectValueType.Variable;
    value: number;
    upgrade: number;
    percent: boolean;
}

export interface EffectValueRange extends AbstractEffectValue {
    type: EffectValueType.Range;
    value: number;
    upgrade: number;
    percent: boolean;
}

export interface EffectValueConstant extends AbstractEffectValue {
    type: EffectValueType.Constant;
    value: number;
}

export interface EffectValueSynergy extends AbstractEffectValue {
    type: EffectValueType.Synergy;
    ratio: number;
    upgrade: number;
    source: string;
}

export interface EffectValueSynergyMinMax extends AbstractEffectValue {
    type: EffectValueType.SynergyMinMax;
    ratio: number;
    upgrade: number;
    source: string;
}