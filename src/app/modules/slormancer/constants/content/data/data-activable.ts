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

function setValueType(values: Array<AbstractEffectValue>, index: number, valueType: EffectValueValueType) {
    const value = values[index]

    if (value) {
        value.valueType = valueType;
    } else {
        throw new Error('failed to change valueType for effect value at index ' + index);
    }
}

function setBaseValue(values: Array<AbstractEffectValue>, index: number, baseValue: number) {
    const value = values[index]

    if (value) {
        value.baseValue = baseValue;
    } else {
        throw new Error('failed to change base value for effect value at index ' + index);
    }
}

function setSynergyAnchor(values: Array<AbstractEffectValue>, index: number, anchor: string) {
    const value = values[index]

    if (value && isEffectValueSynergy(value)) {
        value.anchor = anchor;
    } else {
        throw new Error('failed to change synergy anchor at index ' + index);
    }
}

function halveSynergy(effects: Array<AbstractEffectValue>, index: number) {
    const effect = effects[index];

    if (effect && isEffectValueSynergy(effect)) {
        effect.baseValue = effect.baseValue / 2;
        effect.upgrade = effect.upgrade / 2;
    } else {
        throw new Error('failed to halve synergy at index ' + index);
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
function setSynergyAllowMinMax(values: Array<AbstractEffectValue>, index: number, allowMinMax: boolean) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        value.allowMinMax = allowMinMax;
    } else {
        throw new Error('failed to update allowMinMax at index ' + index);
    }
}

function setSynergyPrecision(values: Array<AbstractEffectValue>, index: number, precision: number) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        value.precision = precision;
    } else {
        throw new Error('failed to update precision at index ' + index);
    }
}

export const DATA_ACTIVABLE: { [key: string]: DataActivable } = {
    0: {
        override: values => {
            overrideValueStat(values, 0, 'golden_buff_retaliate_percent')
            overrideValueStat(values, 1, 'golden_buff_reduced_damage_from_all_percent')
            overrideValueStat(values, 2, 'golden_buff_duration')
        }
    },
    1: {
        override: values => {
            overrideValueStat(values, 0, 'sleeping_powder_duration')
        }
    },
    2: {
        override: values => {
            overrideValueStat(values, 0, 'health_regen_add');
            overrideValueStat(values, 1, 'manabender_buff_duration');
        }
    },
    3: {
        override: values => {
            overrideValueStat(values, 0, 'duration');
        }
    },
    4: {
        override: values => {
            synergyMultiply100(values, 0);
        }
    },
    6: {
        override: values => {
            overrideValueStat(values, 0, 'cooldown_reduction_global_mult');
            overrideValueStat(values, 1, 'elemental_damage_mult');
            overrideValueStat(values, 2, 'basic_damage_percent_mult');
            overrideValueStat(values, 3, 'duration');
        }
    },
    7: {
        override: values => {
            overrideValueStat(values, 0, 'health_restored');
            overrideValueStat(values, 1, 'ring_of_life_health_restored_over_time');
            overrideValueStat(values, 2, 'ring_of_health_duration');

            halveSynergy(values, 0);
            halveSynergy(values, 1);
        }
    },
    8: {
        override: values => {
            overrideValueStat(values, 0, 'mana_restored');
            overrideValueStat(values, 1, 'mana_restored_over_time');
            overrideValueStat(values, 2, 'mana_restored_over_time_duration');
            
            halveSynergy(values, 0);
            halveSynergy(values, 1);
        }
    },
    9: {
        override: values => {
            overrideValueStat(values, 0, 'shadow_repercussion_buff_duration');
        }
    },
    10: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'inextricable_torment_aura_range');
            overrideValueStat(values, 0, 'inextricable_torment_aura_enemy_increased_damage');
            overrideValueStat(values, 1, 'inextricable_torment_aura_enemy_cooldown_reduction_percent');
        }
    },
    11: {
        override: values => {
            overrideValueStat(values, 0, 'fenren_trigger_chance');
        }
    },
    12: {
        override: values => {
            overrideValueStat(values, 0, 'physical_damage');
            overrideValueStat(values, 1, 'septimius_blade_delay');
        }
    },
    13: {
        override: values => {
            overrideValueStat(values, 0, 'weapon_damage');
            setValueType(values, 0, EffectValueValueType.Damage)
            overrideValueStat(values, 1, 'duration');
            setValueType(values, 1, EffectValueValueType.Static)
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'mana_harvest_range');
        }
    },
    14: {
        override: values => {
            overrideValueStat(values, 0, 'garbage_stat');
        }
    },
    15: {
        override: values => {
            overrideValueStat(values, 0, 'garbage_stat');
            overrideValueStat(values, 1, 'concentration_buff_inner_fire_damage_percent');
            overrideValueStat(values, 2, 'concentration_buff_inner_fire_damage_percent_on_elite');
        }
    },
    16: {
        override: values => {
            overrideValueStat(values, 0, 'garbage_stat');
            setSynergyAnchor(values, 1, '@');
            overrideValueStat(values, 1, 'physical_damage');
            setSynergyAllowMinMax(values, 1, false);
            setSynergyPrecision(values, 1, 0);
            overrideValueStat(values, 2, 'garbage_stat');
        }
    },
    17: {
        override: values => {
            setBaseValue(values, 0, 40);
            overrideValueStat(values, 0, 'physical_damage');
            setSynergyAnchor(values, 1, '@');
            overrideValueStat(values, 1, 'skeleton_squire_max_health');
        }
    },
    18: {
        override: values => {
            overrideValueStat(values, 0, 'physical_damage');
            overrideValueStat(values, 1, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'unstable_bones_aoe_range')
        }
    },
    19: {
        override: values => {
            console.log('Base values : ', values);
            overrideValueStat(values, 0, 'garbage_stat');
            overrideValueStat(values, 1, 'garbage_stat');
        }
    }
}