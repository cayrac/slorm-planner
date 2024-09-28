import { DataAncestralLegacy } from '../../../model/content/data/data-ancestral-legacy';
import { AbstractEffectValue } from '../../../model/content/effect-value';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../../model/content/enum/mechanic-type';
import { effectValueConstant } from '../../../util/effect-value.util';
import { isEffectValueSynergy } from '../../../util/utils';

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

function setSource(values: Array<AbstractEffectValue>, index: number, source: string) {
    const value = <AbstractEffectValue>values[index];

    if (isEffectValueSynergy(value)) {
        value.source = source;
    } else {
        throw new Error('failed to update source at index ' + index);
    }
}

function allowSynergyToCascade(values: Array<AbstractEffectValue>, index: number) {
    const value = values[index]

    if (value && isEffectValueSynergy(value)) {
        value.cascadeSynergy = true;
    } else {
        throw new Error('failed to change synergy cascade at index ' + index);
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
    3: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    4: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'duration');
        }
    },
    5: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'scorching_area_duration');
        }
    },
    8: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_fire_imbued');
        }
    },
    10: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    11: {
        override: values => {
            setStat(values, 0, 'crit_chance_percent_against_burning');
        }
    },
    13: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Static, 'garbage_stat');
        }
    },
    14: {
        override: values => {
            setStat(values, 0, 'living_inferno_burn_increased_damage');
            addConstant(values, 7, false, EffectValueValueType.Duration, 'duration');
        }
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
    22: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'duration');
        }
    },
    24: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
        }
    },
    27: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'garbage_stat');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'garbage_stat');
        }
    },
    29: {
        override: values => {
            setStat(values, 0, 'cost_reduction_mult_per_frozen_or_chilled_enemy_nearby');
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
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
    37: {
        override: values => {
            setStat(values, 0, 'cleansing_surge_stack_movement_speed_percent');
            addConstant(values, 8, false, EffectValueValueType.Duration, 'duration');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'cleansing_surge_max_stacks');
        }
    },
    38: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_lightning_imbued');
        }
    },
    39: {
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'charging_up_max_stacks');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'duration');
            addConstant(values, 0.5, false, EffectValueValueType.Stat, 'overcharged_stack_cooldown_reduction_global_mult');
        }
    },
    41: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Stat, 'twitching_warp_distance');
        }
    },
    43: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Static, 'garbage_stat');
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
    50: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'duration');
        }
    },
    52: {
        override: values => {
            setStat(values, 0, 'shield_increased_value_mult');
        }
    },
    53: {
        override: values => {
            setSource(values, 0, 'percent_missing_mana');
            addConstant(values, -100, false, EffectValueValueType.Stat, 'mana_regen_global_mult');
        }
    },
    54: {
        override: values => {
            setStat(values, 0, 'increased_damage_per_negative_effect');
            addConstant(values, 100, false, EffectValueValueType.Static, 'garbage_stat');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'garbage_stat');
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
    59: {
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Stat, 'garbage_stat');
        }
    },
    61: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_shadow_imbued');
            setStat(values, 0, 'shadow_imbued_skill_increased_damage');
        }
    },
    65: {
        override: values => {
            setStat(values, 0, 'shadow_shield_armor_percent');
            setStat(values, 1, 'shadow_shield_elemental_resist_percent');
            setStat(values, 2, 'shadow_shield_health_leech_percent');
            addConstant(values, 8, false, EffectValueValueType.Duration, 'duration');
        }
    },
    67: {
        override: values => {
            setStat(values, 0, 'enduring_blorms_blorm_increased_damage');
        }
    },
    68: {
        override: values => {
            addConstant(values, 25, false, EffectValueValueType.Stat, 'damage_taken_to_mana_percent');
        }
    },
    70: {
        override: values => {
            setStat(values, 0, 'avatar_of_shadow_basic_damage_percent');
            setStat(values, 1, 'avatar_of_shadow_elemental_damage_percent');
            addConstant(values, 10, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'fork_chance_percent');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'recast_chance_percent');
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
    74: {
        override: values => {
            setStat(values, 0, 'shadow_bargain_cooldown_reduction_global_mult');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'duration');
        }
    },
    76: {
        override: values => {
            setStat(values, 0, 'frostfire_armor_res_phy_percent');
            setStat(values, 1, 'frostfire_armor_fire_resistance_percent');
            setStat(values, 2, 'frostfire_armor_ice_resistance_percent');
            addConstant(values, 12, false, EffectValueValueType.Duration, 'duration');
        }
    },
    77: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.AreaOfEffect, 'range');
        }
    },
    78: {
        override: values => {
            setStat(values, 0, 'aurelon_bargain_stack_increased_attack_speed');
            addConstant(values, 10, false, EffectValueValueType.Unknown, 'duration');
            addConstant(values, 0, false, EffectValueValueType.Unknown, 'life_cost');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'aurelon_bargain_max_stacks');
        }
    },
    79: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'duration');
            addConstant(values, 1, false, EffectValueValueType.Duration, 'minimum_life');
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
    83: {
        override: values => {
            setStat(values, 0, 'flawless_defense_projectile_damage_reduction');
        }
    },
    84: {
        override: values => {
            addConstant(values, -100, false, EffectValueValueType.Stat, 'efficiency_skill_reduction_skill_mult');
        }
    },
    85: {
        override: values => {
            setStat(values, 0, 'elemental_temper_buff_elemental_damage_percent');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'elemental_temper_buff_duration');
        }
    },
    86: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'garbage_stat');
        }
    },
    88: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Stat, 'increased_max_stacks');
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
    91: {
        override: values => {
            setStat(values, 0, 'ancestral_instability_crit_damage_percent');
            setStat(values, 1, 'ancestral_instability_brut_damage_percent');
            addConstant(values, 25, false, EffectValueValueType.Static, 'duration');
        }
    },
    92: {
        override: values => {
            setStat(values, 0, 'wild_slap_stun_chance');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'duration');
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
    95: {
        override: values => {
            addConstant(values, 200, false, EffectValueValueType.Static, 'garbage_stat');
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
    108: {
        override: values => {
            allowSynergyToCascade(values, 0)
        }
    },
    109: {
        override: values => {
            allowSynergyToCascade(values, 0)
        }
    },
    110: {
        override: values => {
            allowSynergyToCascade(values, 0)
        }
    },
    111: {
        override: values => {
            allowSynergyToCascade(values, 0)
        }
    },
    112: {
        override: values => {
            allowSynergyToCascade(values, 0)
        }
    }
}