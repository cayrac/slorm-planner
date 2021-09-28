import { DataLegendary } from '../../../model/content/data/data-legendary';
import { LegendaryEffect } from '../../../model/content/legendary-effect';
import { effectValueConstant } from '../../../util/effect-value.util';


function setStat(effect: LegendaryEffect, index: number, stat: string) {
    const value = effect.effects[index]

    if (value) {
        value.effect.stat = stat;
    }
}

function valueMultiply100(effect: LegendaryEffect, index: number) {
    const value = effect.effects[index]

    if (value) {
        value.score = value.score * 100;
    }
}

function addConstant(effect: LegendaryEffect, value: number, stat: string | null = null) {

    effect.effects.push({
        score: value,
        craftedValue: 0,
        possibleCraftedValues: [],
        maxPossibleCraftedValue: 0,
        minPossibleCraftedValue: 0,
        effect: effectValueConstant(value, false, stat)
    });
}

export const DATA_LEGENDARY: { [key: number]: DataLegendary } = {
    13: {
        override: (effect) => {
            setStat(effect, 0, 'coward_effect_cooldown');
            setStat(effect, 1, 'coward_effect_missing_health_restored');
        }
    },
    14: {
        override: (effect) => {
            setStat(effect, 0, 'damages_dealt_to_mana');
        }
    },
    15: {
        override: (effect) => {
            setStat(effect, 0, 'immortal_grasp_health_restored');
            setStat(effect, 0, 'immortal_grasp_duration');
        }
    },
    16: {
        override: (effect) => {
            setStat(effect, 0, 'stability_max_stacks');
            setStat(effect, 1, 'stability_stack_reduced_on_all');
        }
    },
    17: {
        override: (effect) => {
            setStat(effect, 0, 'arah_restoration_chance');
            setStat(effect, 1, 'arah_restoration_missing_mana_percent');
        }
    },
    18: {
        override: (effect) => {
            setStat(effect, 0, 'cooldown_reduction_global_mult');
        }
    },
    19: {
        override: (effect) => {
            setStat(effect, 0, 'movement_skill_cooldown_reduction_percent');
            setStat(effect, 1, 'hremesal_effect_cooldown');
        }
    },
    20: {
        override: (effect) => {
            setStat(effect, 0, 'crit_chance_global_mult_per_yard');
        }
    },
    23: {
        override: (effect) => {
            setStat(effect, 2, 'buff_indomptable_mountain_def_phy_mult');
            setStat(effect, 3, 'buff_indomptable_mountain_def_phy_duration');
        }
    },
    24: {
        override: (effect) => {
            setStat(effect, 0, 'enemy_full_life_crit_chance_global_mult');
            setStat(effect, 1, 'enemy_full_life_crit_chance_global_mult_treshold');
        }
    },
    26: {
        override: (effect) => {
            setStat(effect, 0, 'conquest_stack_inner_fire_max_number_add');
            setStat(effect, 1, 'conquest_stack_duration');
            setStat(effect, 2, 'conquest_max_stacks');
        }
    },
    28: {
        override: (effect) => {
            setStat(effect, 0, 'staggered_damage_percent');
            addConstant(effect, 10, 'staggered_damage_duration');
        }
    },
    29: {
        override: (effect) => {
            setStat(effect, 0, 'ancestral_fervor_buff_chance_on_ancestral_skill_cast');
            setStat(effect, 1, 'ancestral_fervor_buff_crit_chance_percent');
            setStat(effect, 2, 'ancestral_fervor_buff_duration');
        }
    },
    32: {
        override: (effect) => {
            setStat(effect, 0, 'overdrive_damage_global_mult_per_bounce_left');
        }
    },
    33: {
        override: (effect) => {
            setStat(effect, 0, 'overdrive_damage_global_mult_last_bounce');
            valueMultiply100(effect, 0);
        }
    },
    36: {
        override: (effect) => {
            addConstant(effect, 100, 'reaper_added_to_elements');
        }
    },
    38: {
        override: (effect) => {
            setStat(effect, 0, 'slorm_reaper_copy_chance');
            setStat(effect, 1, 'slorm_reaper_damages');
        }
    },
    39: {
        override: (effect) => {
            setStat(effect, 0, 'deadly_splinter_damages');
            // valueMultiply100(effect, 0);
        }
    },
    41: {
        override: (effect) => {
            setStat(effect, 0, 'vilinis_delay');
            setStat(effect, 1, 'vilinis_damage_from_initial_hit');
            setStat(effect, 2, 'vilinis_reapply_chance');
        }
    },
    54: {
        override: (effect) => {
            setStat(effect, 0, 'stab_copy_chance');
            setStat(effect, 1, 'stab_copy_count');
        }
    },
    55: {
        override: (effect) => {
            setStat(effect, 0, 'explosive_projectile_cooldown_reduction_percent_per_hit');
            setStat(effect, 1, 'stab_copy_count');
        }
    },
    56: {
        override: (effect) => {
            setStat(effect, 0, 'additional_wandering_arrow_add');
        }
    },
    57: {
        override: (effect) => {
            addConstant(effect, 4);
        }
    },
    58: {
        override: (effect) => {
            setStat(effect, 0, 'poison_spread_chance_per_previous_tick');
        }
    },
    61: {
        override: (effect) => {
            setStat(effect, 0, 'arrow_shot_fork_chance_after_rebound');
        }
    },
    62: {
        override: (effect) => {
            addConstant(effect, 5, 'trap_pull_distance');
        }
    },
    69: {
        override: (effect) => {
            addConstant(effect, 2.6);
        }
    },
    73: {
        override: (effect) => {
            setStat(effect, 0, 'burning_trail_burning_rage_burning_change');
        }
    },
    74: {
        override: (effect) => {
            setStat(effect, 0, 'frist_crit_chance_per_frostbolt_shot_recently');
            setStat(effect, 1, 'frist_crit_damage_per_frostbolt_shot_recently');
            setStat(effect, 2, 'frostbolt_shot_recently_duration');
        }
    },
    75: {
        override: (effect) => {
            setStat(effect, 0, 'high_voltage_max_stacks');
            setStat(effect, 0, 'high_voltage_stack_spark_machine_increased_damage');
        }
    },
    76: {
        override: (effect) => {
            setStat(effect, 0, 'enligntment_stack_gain_min');
            setStat(effect, 1, 'enligntment_stack_gain_max');
            setStat(effect, 2, 'enligntment_stack_min_elemental_damage_add');
        }
    },
    78: {
        override: (effect) => {
            setStat(effect, 0, 'ancestral_rank_add');
        }
    },
}