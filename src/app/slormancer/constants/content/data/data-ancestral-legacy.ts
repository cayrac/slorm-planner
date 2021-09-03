import { DataAncestralLegacy } from '../../../model/content/data/data-ancestral-legacy';
import { AbstractEffectValue } from '../../../model/content/effect-value';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../../model/content/enum/mechanic-type';
import { effectValueConstant } from '../../../util/effect-value.util';

function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType))
}

export const DATA_ANCESTRAL_LEGACY: { [key: number]: DataAncestralLegacy } = {    
    0: {
        links: []
    },
    15: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_aoe');
        },
        links: []
    },
    16: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_aoe');
        },
        links: []
    },
    19: {
        links: []
    },
    24: {
        links: []
    },
    32: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'seal_duration');
        },
        links: []
    },
    35: {
        links: []
    },
    53: {
        links: []
    },
    55: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'seal_duration');
        },
        links: []
    },
    57: {
        links: []
    },
    72: {
        links: []
    },
    80: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'burn_duration');
        },
        links: []
    },
    81: {
        links: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    85: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'buff_duration');
        },
        links: []
    },
    93: {
        links: []
    },
    94: {
        links: []
    },
    97: {
        links: []
    },
    98: {
        links: []
    },
    99: {
        links: []
    },
    100: {
        links: []
    },
    101: {
        override: values => {
            addConstant(values, 25, false, EffectValueValueType.Flat, 'buff_life_treshold');
        },
        links: []
    },
    104: {
        links: []
    },
    119: {
        links: []
    },
    121: {
        links: []
    },
    125: {
        links: []
    },
    126: {
        links: []
    },
    127: {
        links: []
    },
    128: {
        links: []
    },
    129: {
        links: []
    },
    143: {
        links: []
    },
    148: {
        links: []
    },
    149: {
        links: []
    }
}