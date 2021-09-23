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
    },
    15: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_aoe');
        }
    },
    16: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_aoe');
        }
    },
    19: {
    },
    24: {
    },
    32: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'seal_duration');
        }
    },
    35: {
    },
    53: {
    },
    55: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'seal_duration');
        }
    },
    57: {
    },
    72: {
    },
    80: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'burn_duration');
        }
    },
    81: {
        additionalMechanics: [MechanicType.InnerFire]
    },
    85: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'buff_duration');
        }
    },
    93: {
    },
    94: {
    },
    97: {
    },
    98: {
    },
    99: {
    },
    100: {
    },
    101: {
        override: values => {
            addConstant(values, 25, false, EffectValueValueType.Flat, 'buff_life_treshold');
        }
    },
    104: {
    },
    119: {
    },
    121: {
    },
    125: {
    },
    126: {
    },
    127: {
    },
    128: {
    },
    129: {
    },
    143: {
    },
    148: {
    },
    149: {
    }
}