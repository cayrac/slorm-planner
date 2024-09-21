import { DataAttribute } from '../../../model/content/data/data-attribute';
import { Trait } from '../../../model/content/trait';
import { isEffectValueSynergy } from '../../../util/utils';


function setStat(trait: Trait, index: number, stat: string) {
    const value = trait.values[index]

    if (value) {
        value.stat = stat;
    }
}

function setSynergyPrecision(trait: Trait, index: number, precision: number) {
    const value = trait.values[index];

    if (value && isEffectValueSynergy(value)) {
        value.precision = precision;
    } else {
        throw new Error('failed to update precision at index ' + index);
    }
}

function allowSynergyToCascade(trait: Trait, index: number) {
    const value = trait.values[index];

    if (value && isEffectValueSynergy(value)) {
        value.cascadeSynergy = true;
    } else {
        throw new Error('failed to update synergy cascading at index ' + index);
    }
}

function synergySetAllowMinMax(trait: Trait, index: number, allowMinMaw: boolean) {
    const value = trait.values[index];

    if (value && isEffectValueSynergy(value)) {
        value.allowMinMax = allowMinMaw;
    } else {
        throw new Error('failed to update allow min max at index ' + index);
    }
}

export const DATA_ATTRIBUTE: { [key: number]: DataAttribute } = {
    3: {
        override: trait => {
            allowSynergyToCascade(trait, 0);
        }
    },
    6: {
        override: trait => {
            setStat(trait, 0, 'reduced_damage_from_melee_percent_for_each_ennemy');
            setStat(trait, 1, 'reduced_damage_from_melee_percent_for_each_ennemy_radius');
        }
    },
    9: {
        override: trait => {
            setStat(trait, 0, 'primary_secondary_skill_blind_on_hit_chance');
            setStat(trait, 1, 'primary_secondary_skill_blind_on_hit_duration');
        }
    },
    12: {
        override: trait => {
            setStat(trait, 0, 'res_phy_global_mult_on_low_life');
            setStat(trait, 1, 'res_phy_global_mult_on_low_life_treshold');
        }
    },
    15: {
        override: trait => {
            setStat(trait, 0, 'primary_secondary_skill_daze_on_hit_chance');
            setStat(trait, 1, 'primary_secondary_skill_daze_on_hit_duration');
        }
    },
    19: {
        override: trait => {
            setStat(trait, 0, 'secondary_skill_ignore_def_phy_chance');
        }
    },
    22: {
        override: trait => {
            setStat(trait, 0, 'health_leech_percent_on_low_life');
            setStat(trait, 1, 'health_leech_percent_on_low_life_treshold');
        }
    },
    25: {
        override: trait => {
            setSynergyPrecision(trait, 0, 3);
            synergySetAllowMinMax(trait, 0, false);
        }
    },
    28: {
        override: trait => {
            setSynergyPrecision(trait, 0, 3);
            allowSynergyToCascade(trait, 0);
        }
    },
    31: {
        override: trait => {
            setStat(trait, 0, 'crit_chance_global_mult_after_hit_taken');
        }
    },
    35: {
        override: trait => {
            setStat(trait, 0, 'crit_damage_percent_for_each_ennemy');
            setStat(trait, 1, 'crit_damage_percent_for_each_ennemy_radius');
        }
    },
    38: {
        override: trait => {
            setStat(trait, 0, 'weapon_damage_mult_after_support_cast');
        }
    },
    41: {
        override: trait => {
            setStat(trait, 0, 'cooldown_reduction_global_mult_after_crit');
            setStat(trait, 1, 'cooldown_reduction_global_mult_after_crit_duration');
        }
    },
    44: {
        override: trait => {
            setStat(trait, 0, 'secondary_skill_overdrive_bounce_number_global_mult');
        }
    },
    47: {
        override: trait => {
            setStat(trait, 0, 'the_speed_percent_after_dodge');
            setStat(trait, 1, 'the_speed_percent_after_dodge_duration');
        }
    },
    51: {
        override: trait => {
            setStat(trait, 0, 'health_on_hit_add_after_crit');
            setStat(trait, 1, 'health_on_hit_add_after_crit_duration');
        }
    },
    54: {
        override: trait => {
            setStat(trait, 0, 'increased_damage_on_elite_percent_for_each_elite');
            setStat(trait, 1, 'increased_damage_on_elite_percent_for_each_elite_radius');
        }
    },
    57: {
        override: trait => {
            setStat(trait, 0, 'reduced_damage_from_all_percent_after_hit_taken');
            setStat(trait, 1, 'reduced_damage_from_all_percent_after_hit_taken_duration');
            setStat(trait, 2, 'reduced_damage_from_all_percent_after_hit_taken_max_stack');
        }
    },
    60: {
        override: trait => {
            setStat(trait, 0, 'retaliate_percent_on_low_life');
            setStat(trait, 1, 'retaliate_percent_on_low_life_treshold');
        }
    },
    63: {
        override: trait => {
            setStat(trait, 0, 'all_skill_mana_cost_to_life_chance');
            setStat(trait, 1, 'all_skill_mana_cost_to_life_percent');
        }
    },
    67: {
        override: trait => {
            setStat(trait, 0, 'all_skill_cost_reduction_per_cast');
            setStat(trait, 1, 'all_skill_cost_reduction_per_cast_duration');
        }
    },
    73: {
        override: trait => {
            setStat(trait, 0, 'health_percent_restored_on_ancestral_damages');
        }
    },
    76: {
        override: trait => {
            setStat(trait, 0, 'support_skill_cooldown_reset_on_cast_chance');
        }
    },
    79: {
        override: trait => {
            setStat(trait, 0, 'primary_secondary_skill_silence_on_hit_chance');
            setStat(trait, 1, 'primary_secondary_skill_silence_on_hit_duration');
        }
    },
    83: {
        override: trait => {
            setStat(trait, 0, 'aoe_increased_effect_percent_on_low_mana');
            setStat(trait, 1, 'aoe_increased_effect_percent_on_low_mana_treshold');
        }
    },
    92: {
        override: trait => {
            setStat(trait, 0, 'res_mag_global_mult_after_elemental_damage_taken');
            setStat(trait, 1, 'res_mag_global_mult_after_elemental_damage_taken_duration');
        }
    },
    89: {
        override: trait => {
            setStat(trait, 0, 'minion_increased_damage_percent_per_controlled_minion');
        }
    },
    86: {
        override: trait => {
            setStat(trait, 0, 'elemental_prowess_elemental_damage_percent');
            setStat(trait, 1, 'elemental_prowess_duration');
        }
    },
    95: {
        override: trait => {
            setStat(trait, 0, 'ancestral_skill_cooldown_reduction_percent');
        }
    },
    99: {
        override: trait => {
            setStat(trait, 0, 'totem_dexterity_totem_increased_effect_percent');
            setStat(trait, 1, 'totem_dexterity_max_stack');
        }
    },
    102: {
        override: trait => {
            setStat(trait, 0, 'primary_skill_slow_on_hit_chance');
            setStat(trait, 1, 'primary_skill_slow_on_hit_slow_percent');
            setStat(trait, 2, 'primary_skill_slow_on_hit_duration');
        }
    },
    105: {
        override: trait => {
            setStat(trait, 0, 'chance_to_pierce_percent_on_low_life');
            setStat(trait, 1, 'fork_chance_percent_on_low_life');
            setStat(trait, 2, 'rebound_chance_percent_on_low_life');
            setStat(trait, 3, 'increased_proj_speed_percent_on_low_life');
            setStat(trait, 4, 'pierce_fork_rebound_proj_speed_on_low_life_treshold');
        }
    },
    108: {
        override: trait => {
            setStat(trait, 0, 'crit_chance_percent_if_no_enemies_around');
            setStat(trait, 1, 'crit_chance_percent_if_no_enemies_around_radius');
        }
    },
    111: {
        override: trait => {
            setStat(trait, 0, 'increased_damage_for_each_yard_with_target');
        }
    },
    118: {
        override: trait => {
            setStat(trait, 0, 'greed_stack_crit_chance_percent');
            setStat(trait, 1, 'greed_stack_duration');
            setStat(trait, 2, 'greed_stack_max_stack');
        }
    },
    121: {
        override: trait => {
            setStat(trait, 0, 'strider_stack_crit_chance_percent');
            setStat(trait, 1, 'strider_stack_duration');
            setStat(trait, 2, 'strider_stack_max_stack');
        }
    },
    124: {
        override: trait => {
            setStat(trait, 0, 'percent_missing_health_resored_on_elite_kill');
        }
    },
    127: {
        override: trait => {
            setStat(trait, 0, 'merchant_stack_goldus');
            setStat(trait, 1, 'merchant_stack_min_basic_damage_add');
            setStat(trait, 2, 'merchant_stack_max_stack');
        }
    },
    115: {
        override: trait => {
            setStat(trait, 0, 'legendary_elemental_damage_percent');
        }
    }
}