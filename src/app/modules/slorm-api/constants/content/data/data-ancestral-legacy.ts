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

function setSynergyAllowMinMax(values: Array<AbstractEffectValue>, index: number, allowMinMax: boolean) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        // warnIfEqual(value.allowMinMax, allowMinMax, 'ancestral legacy setSynergyAllowMinMax at index ' + index + ' did not changed anthing', values);
        value.allowMinMax = allowMinMax;
    } else {
        throw new Error('failed to update allowMinMax at index ' + index);
    }
}

export const DATA_ANCESTRAL_LEGACY: { [key: number]: DataAncestralLegacy } = {
    0: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
        }
    },
    1: {
        additionalMechanics: [ MechanicType.Fireball ]
    },
    2: {
        override: values => {
            allowSynergyToCascade(values, 0);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    3: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
            allowSynergyToCascade(values, 0);
        }
    },
    4: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'duration');
        },
        additionalMechanics: [ MechanicType.WalkingBomb ]
    },
    5: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'scorching_area_duration');
        },
        additionalMechanics: [ MechanicType.Fireball ]
    },
    6: {
        additionalMechanics: [ MechanicType.Fireball ]
    },
    7: {
        additionalMechanics: [ MechanicType.WalkingBomb ]
    },
    8: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_fire_imbued');
        },
        additionalMechanics: [ MechanicType.Burn ]
    },
    9: {
        additionalMechanics: [ MechanicType.Burn ]
    },
    10: {
        override: values => {
            allowSynergyToCascade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.WalkingBomb, MechanicType.Burn ]
    },
    11: {
        override: values => {
            setStat(values, 0, 'crit_chance_percent_against_burning');
        },
        additionalMechanics: [ MechanicType.Burn ]
    },
    12: {
        additionalMechanics: [ MechanicType.WalkingBomb ]
    },
    13: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Static, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.Fireball, MechanicType.Burn ]
    },
    14: {
        override: values => {
            setStat(values, 0, 'living_inferno_burn_increased_damage');
            addConstant(values, 7, false, EffectValueValueType.Duration, 'duration');
        },
        additionalMechanics: [ MechanicType.Burn ]
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
        },
        additionalBuffs: [ 'ice_chill' ]
    },
    17: {
        additionalBuffs: [ 'ice_frozen' ]
    },
    18: {
        additionalBuffs: [ 'ice_chill', 'ice_frozen' ]
    },
    19: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
        },
        additionalBuffs: [ 'ice_chill', 'ice_frozen' ]
    },
    21: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_ice_imbued');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'garbage_stat');
        },
        additionalBuffs: [ 'ice_chill' ]
    },
    22: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'duration');
        },
        additionalBuffs: [ 'ice_chill', 'ice_frozen' ]
    },
    23: {
        override: values => {
            allowSynergyToCascade(values, 0);
        },
        additionalBuffs: [ 'ice_frozen' ]
    },
    24: {
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
        }
    },
    25: {
        additionalMechanics: [ MechanicType.Frostbolt ],
        additionalBuffs: [ 'ice_chill' ]
    },
    26: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Static, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.Frostbolt ],
    },
    27: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'garbage_stat');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.Frostbolt ],
        additionalBuffs: [ 'ice_chill', 'ice_frozen' ]
    },
    28: {
        additionalMechanics: [ MechanicType.Frostbolt ]
    },
    29: {
        override: values => {
            setStat(values, 0, 'cost_reduction_mult_per_frozen_or_chilled_enemy_nearby');
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        },
        additionalBuffs: [ 'ice_chill', 'ice_frozen' ]
    },
    30: {
        override: values => {
            allowSynergyToCascade(values, 0);
        }
    },
    32: {
        override: (values, ancestralLegacy) => {
            allowSynergyToCascade(values, 0);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'scorched_earth_duration');
            ancestralLegacy.baseCost = 123;
            ancestralLegacy.costPerRank = 16;
        }
    },
    33: {
        override: (values, ancestralLegacy) => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'electrify_duration');
            setStat(values, 0, 'electrify_increased_lightning_damage');
            ancestralLegacy.baseCost = 123;
        }
    },
    34: {
        override: values => {
            setStat(values, 0, 'garbage_stat');
            allowSynergyToCascade(values, 0);
            setSynergyAllowMinMax(values, 0, false);
        }
    },
    35: {
        override: values => {
            allowSynergyToCascade(values, 0);
        }
    },
    36: {
        additionalMechanics: [ MechanicType.LightningRod ]
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
            allowSynergyToCascade(values, 0);
        }
    },
    39: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'duration');
            addConstant(values, 0.5, false, EffectValueValueType.Stat, 'overcharged_stack_cooldown_reduction_global_mult');
            addConstant(values, 50, false, EffectValueValueType.Stat, 'charging_up_max_stacks');
        }
    },
    41: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Stat, 'twitching_warp_distance');
        }
    },
    42: {
        additionalMechanics: [ MechanicType.LightningRod ]
    },
    43: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Static, 'garbage_stat');
        }
    },
    46: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'light_wave_aoe');
        },
        additionalBuffs: [ 'blind' ]
    },
    47: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        },
        additionalBuffs: [ 'silence' ]
    },
    48: {
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    49: {
        override: values => {
            addConstant(values, 20, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_light_imbued');
        },
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    50: {
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'duration');
        },
        additionalBuffs: [ 'armor_broken', 'elemental_broken', 'slow', 'daze', 'blind', 'silence' ]
    },
    52: {
        override: values => {
            setStat(values, 0, 'shield_increased_value_mult');
        },
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    53: {
        override: values => {
            setSource(values, 0, 'percent_missing_mana');
            addConstant(values, -100, false, EffectValueValueType.Stat, 'mana_regen_global_mult');
        },
        additionalMechanics: [ MechanicType.Dart ]
    },
    54: {
        override: values => {
            setStat(values, 0, 'increased_damage_per_negative_effect');
            addConstant(values, 100, false, EffectValueValueType.Static, 'garbage_stat');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'garbage_stat');
        },
        additionalBuffs: [ 'armor_broken', 'elemental_broken', 'slow', 'daze', 'blind', 'silence' ]
    },
    55: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'agent_of_shield_duration');
        },
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    56: {
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.Dart ]
    },
    57: {
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    58: {
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    59: {
        override: values => {
            setStat(values, 0, 'flashing_dart_additional_damage');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'garbage_stat');
        },
        additionalMechanics: [ MechanicType.Dart ]
    },
    60: {
        additionalMechanics: [ MechanicType.ShieldGlobe ]
    },
    61: {
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'primary_secondary_skill_shadow_imbued');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'add_life_cost_to_mana_cost');
            setStat(values, 0, 'shadow_imbued_skill_increased_damage');
        }
    },
    62: {
        additionalMechanics: [ MechanicType.SoulBound ]
    },
    63: {
        additionalMechanics: [ MechanicType.Blorm ]
    },
    64: {
        additionalMechanics: [ MechanicType.SoulBound ]
    },
    65: {
        override: values => {
            setStat(values, 0, 'shadow_shield_armor_percent');
            setStat(values, 1, 'shadow_shield_elemental_resist_percent');
            setStat(values, 2, 'shadow_shield_health_leech_percent');
            addConstant(values, 8, false, EffectValueValueType.Duration, 'duration');
        }
    },
    66: {
        additionalMechanics: [ MechanicType.Blorm ]
    },
    67: {
        override: values => {
            setStat(values, 0, 'enduring_blorms_blorm_increased_damage');
        },
        additionalMechanics: [ MechanicType.Blorm ]
    },
    68: {
        override: values => {
            addConstant(values, 25, false, EffectValueValueType.Stat, 'damage_taken_to_mana_percent');
        }
    },
    69: {
        additionalMechanics: [ MechanicType.SoulBound ]
    },
    70: {
        override: values => {
            setStat(values, 0, 'avatar_of_shadow_basic_damage_percent');
            setStat(values, 1, 'avatar_of_shadow_elemental_damage_percent');
            addConstant(values, 10, false, EffectValueValueType.Duration, 'avatar_of_shadow_duration');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'fork_chance_percent');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'recast_chance_percent');
        }
    },
    71: {
        additionalMechanics: [ MechanicType.Blorm ]
    },
    72: {
        override: values => {
            setStat(values, 0, 'soul_bound_buff_soul_bound_on_hit_max');
        },
        additionalMechanics: [ MechanicType.SoulBound ]
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
    75: {
        additionalMechanics: [ MechanicType.Blorm ]
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
        },
        additionalMechanics: [ MechanicType.ShieldGlobe ]
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
        },
        additionalBuffs: [ 'stun' ]
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
            setStat(values, 0, 'raw_emergency_min_raw_damage_add_on_low_life');
            addConstant(values, 50, false, EffectValueValueType.Flat, 'raw_emergency_min_raw_damage_add_on_low_life_treshold');
        }
    },
    102: {
        override: values => {
            setStat(values, 0, 'elemental_resources_min_elemental_damage_add_on_low_mana');
            addConstant(values, 25, false, EffectValueValueType.Stat, 'elemental_resources_min_elemental_damage_add_on_low_mana_treshold');
        }
    },
    104: {
        override: values => {
            allowSynergyToCascade(values, 0);
        }
    },
    105: {
        override: values => {
            allowSynergyToCascade(values, 0);
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