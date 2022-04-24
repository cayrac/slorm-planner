import { DataAncestralLegacy } from '../../../model/content/data/data-ancestral-legacy';
import { AbstractEffectValue } from '../../../model/content/effect-value';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../../model/content/enum/mechanic-type';
import { effectValueConstant } from '../../../util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../../util/utils';

function setStat(values: Array<AbstractEffectValue>, index: number, stat: string) {
    const value = values[index]

    if (value) {
        value.stat = stat;
    } else {
        throw new Error('failed to change stat for effect value at index ' + index);
    }
}

function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType))
}

function synergyMultiply100(values: Array<AbstractEffectValue>, index: number) {
    const value = values[index];

    if (value && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        value.baseValue = value.upgrade * 100;
        value.upgrade = 0;
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}

export const DATA_ANCESTRAL_LEGACY: { [key: number]: DataAncestralLegacy } = {
    0: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
        }
    },
    2: {
        override: values => {
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    8: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_fire_imbued');
        }
    },
    5: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'scorching_area_duration');
        },
        additionalMechanics: [MechanicType.Fireball]
    },
    15: {
        override: values => {
            setStat(values, 0, 'aura_air_conditionner_enemy_cooldown_reduction_global_mult');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_air_conditionner_aoe');
        }
    },
    16: {
        override: values => {
            setStat(values, 0, 'aura_neriya_shield_res_mag_add');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aura_neriya_shield_aoe');
        }
    },
    19: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
        }
    },
    21: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_ice_imbued');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'garbage_stat');
        }
    },
    24: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
        }
    },
    29: {
        override: values => {
            setStat(values, 0, 'cost_reduction_mult_per_frozen_or_chilled_enemy_nearby');
        }
    },
    32: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'scorched_earth_duration');
        }
    },
    33: {
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'electrify_duration');
            setStat(values, 0, 'electrify_increased_lightning_damage');
        }
    },
    38: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_lightning_imbued');
        }
    },
    41: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Stat, 'twitching_warp_distance');
        }
    },
    46: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'light_wave_aoe');
        }
    },
    47: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    49: {
        override: values => {
            addConstant(values, 20, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_light_imbued');
        }
    },
    52: {
        override: values => {
            setStat(values, 0, 'shield_increased_value_mult');
        }
    },
    55: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'agent_of_shield_duration');
        }
    },
    56: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'garbage_stat');
        }
    },
    61: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_shadow_imbued');
            setStat(values, 0, 'shadow_imbued_skill_increased_damage');
        }
    },
    72: {
        override: values => {
            setStat(values, 0, 'soul_bound_buff_soul_bound_on_hit_max');
        }
    },
    73: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'garbage_stat');
        }
    },
    80: {
        override: values => {
            setStat(values, 0, 'burning_shadow_buff_basic_damage_percent');
            setStat(values, 1, 'burning_shadow_buff_crit_damage_percent');
            addConstant(values, 7, false, EffectValueValueType.Duration, 'burning_shadow_buff_duration');
        }
    },
    81: {
        additionalMechanics: [MechanicType.InnerFire]
    },
    82: {
        override: values => {
            setStat(values, 0, 'focus_mana_regen_percent');
        }
    },
    85: {
        override: values => {
            setStat(values, 0, 'elemental_temper_buff_elemental_damage_percent');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'elemental_temper_buff_duration');
        }
    },
    89: {
        override: values => {
            setStat(values, 0, 'cost_per_second_reduction');
        }
    },
    90: {
        override: values => {
            setStat(values, 0, 'cost_lock_reduction');
        }
    },
    93: {
        override: values => {
            setStat(values, 0, 'aura_elemental_swap_elemental_damage_percent');
            addConstant(values, 100, true, EffectValueValueType.Static, 'aura_elemental_swap_cost_increase');
        }
    },
    94: {
        override: values => {
            setStat(values, 0, 'aura_risk_of_pain_trigger_all_equipped_ancestral_strike_effect_on_hit_taken_chance');
        }
    },
    101: {
        override: values => {
            setStat(values, 0, 'elemental_emergency_min_elemental_damage_add_on_low_life');
            addConstant(values, 25, false, EffectValueValueType.Flat, 'elemental_emergency_min_elemental_damage_add_on_low_life_treshold');
        }
    },
    102: {
        override: values => {
            setStat(values, 0, 'elemental_resources_min_elemental_damage_add_on_low_mana');
            addConstant(values, 25, false, EffectValueValueType.Stat, 'elemental_resources_min_elemental_damage_add_on_low_mana_treshold');
        }
    },
    106: {
        override: values => {
            setStat(values, 0, 'elemental_spirit_stack_elemental_damage_percent');
            addConstant(values, 10, false, EffectValueValueType.Duration, 'elemental_spirit_stack_duration');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'elemental_spirit_max_stacks');
        }
    },
    107: {
        override: values => {
            setStat(values, 0, 'elemental_damage_percent_per_active_aura');
        }
    },
    114: {
        override: values => {
            synergyMultiply100(values, 0);
        }
    }
}