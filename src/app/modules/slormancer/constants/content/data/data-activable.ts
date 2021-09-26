import { DataActivable } from '../../../model/content/data/data-activable';
import { AbstractEffectValue } from '../../../model/content/effect-value';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { effectValueConstant } from '../../../util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../../util/utils';

function overrideValueStat(effects: Array<AbstractEffectValue>, index: number, stat: string) {
    const effect = effects[index];

    if (effect) {
        effect.stat = stat;
    } else {
        throw new Error('failed to override effect stat at index ' + index + ' with : ' + stat);
    }
}

function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType));
}

function synergyMultiply100(effects: Array<AbstractEffectValue>, index: number) {

    const value = effects[index];

    if (value && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        value.baseValue = value.baseValue * 100;
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}

export const DATA_ACTIVABLE: { [key: string]: DataActivable } = {
    0: {
        override: values => {
            overrideValueStat(values, 0, 'golden_buff_retaliate_percent')
            overrideValueStat(values, 1, 'golden_buff_reduced_damage_from_all_percent')
        }
    },
    2: {
        override: values => {
            overrideValueStat(values, 0, 'health_regen_add');
            overrideValueStat(values, 1, 'manabender_buff_duration');
        }
    },
    4: {
        override: values => {
            synergyMultiply100(values, 0);
        }
    },
    7: {
        override: values => {
            overrideValueStat(values, 0, 'health_restored');
            overrideValueStat(values, 1, 'ring_of_life_health_restored_over_time');
            overrideValueStat(values, 2, 'ring_of_health_duration');
        }
    },
    8: {
        override: values => {
            overrideValueStat(values, 0, 'mana_restored');
            overrideValueStat(values, 1, 'ring_of_mana_mana_restored_over_time');
            overrideValueStat(values, 2, 'ring_of_mana_duration');
        }
    },
    10: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'inextricable_torment_aura_range');
            overrideValueStat(values, 1, 'inextricable_torment_aura_enemy_increased_damage');
            overrideValueStat(values, 2, 'inextricable_torment_aura_enemy_cooldown_reduction_percent');
        }
    },
    11: {
        override: values => {
            overrideValueStat(values, 0, 'fenren_trigger_chance');
        }
    },
    12: {
        override: values => {
            overrideValueStat(values, 0, 'septimius_blade_damage');
            overrideValueStat(values, 1, 'septimius_blade_delay');
        }
    }
}