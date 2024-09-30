import { DataLegendary } from '../../../model/content/data/data-legendary';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { LegendaryEffect } from '../../../model/content/legendary-effect';
import { effectValueConstant } from '../../../util/effect-value.util';
import { isEffectValueSynergy, warnIfEqual } from '../../../util/utils';


function setStat(effect: LegendaryEffect, index: number, stat: string) {
    const value = effect.effects[index]

    if (value) {
        warnIfEqual(value.effect.stat, stat, 'legendary setStat at index ' + index + ' did not changed anthing', effect);
        value.effect.stat = stat;
    } else {
        throw new Error('failed to update stat for legendary effect at index ' + index);
    }
}

function valueMultiply100(effect: LegendaryEffect, index: number) {
    const value = effect.effects[index]

    if (value) {
        value.score = value.score * 100;
    } else {
        throw new Error('failed to multiply synergy percent at index ' + index);
    }
}

function synergySetAllowMinMax(effect: LegendaryEffect, index: number, allowMinMaw: boolean) {
    const value = effect.effects[index]

    if (value && isEffectValueSynergy(value.effect)) {
        warnIfEqual(value.effect.allowMinMax, allowMinMaw, 'legendary synergySetAllowMinMax at index ' + index + ' did not changed anthing', effect);
        value.effect.allowMinMax = allowMinMaw;
    } else {
        throw new Error('failed to update allow min max at index ' + index);
    }
}

function addConstant(effect: LegendaryEffect, value: number, stat: string, valueType: EffectValueValueType) {

    effect.effects.push({
        score: value,
        craftedValue: 0,
        possibleCraftedValues: [],
        maxPossibleCraftedValue: 0,
        minPossibleCraftedValue: 0,
        effect: effectValueConstant(value, false, stat, valueType)
    });
}


function allowSynergyToCascade(effect: LegendaryEffect, index: number) {
    const value = effect.effects[index];

    if (value && isEffectValueSynergy(value.effect)) {
        value.effect.cascadeSynergy = true;
    } else {
        throw new Error('failed to update synergy cascading at index ' + index);
    }
}

export const DATA_LEGENDARY: { [key: number]: DataLegendary } = {
    12: {
        override: (effect) => {
            setStat(effect, 0, 'garbage_stat');
        }
    },
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
            synergySetAllowMinMax(effect, 1, false);
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
            setStat(effect, 0, 'cooldown_time_reduction_multiplier');
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
            allowSynergyToCascade(effect, 1);
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
            addConstant(effect, 10, 'staggered_damage_duration', EffectValueValueType.Stat);
        }
    },
    29: {
        override: (effect) => {
            setStat(effect, 0, 'ancestral_fervor_buff_chance_on_ancestral_skill_cast');
            setStat(effect, 1, 'ancestral_fervor_buff_crit_chance_percent');
            setStat(effect, 2, 'ancestral_fervor_buff_duration');
        }
    },
    30: {
        override: (effect) => {
            setStat(effect, 0, 'soul_mantle_enemy_max_health_as_additional_damage_per_tick');
        }
    },
    31: {
        override: (effect) => {
            setStat(effect, 0, 'ancient_recognition_buff_duration');
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
    34: {
        override: (effect) => {
            setStat(effect, 0, 'phoenix_revive_max_health_percent');
            setStat(effect, 1, 'phoenix_invulnerability_duration');
            setStat(effect, 2, 'phoenix_revive_cooldown');
        }
    },
    36: {
        override: (effect) => {
            addConstant(effect, 100, 'reaper_added_to_elements', EffectValueValueType.Stat);
        }
    },
    37: {
        override: (effect) => {
            setStat(effect, 0, 'idle_remove_delay');
        }
    },
    38: {
        override: (effect) => {
            setStat(effect, 0, 'slorm_reaper_copy_chance');
        }
    },
    39: {
        override: (effect) => {
            setStat(effect, 0, 'physical_damage');
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
    45: {
        override: (effect) => {
            setStat(effect, 0, 'splintered_max_stacks');
            setStat(effect, 1, 'splintered_stack_increased_effect');
        }
    },
    49: {
        override: (effect) => {
            setStat(effect, 0, 'astral_retribution_on_elder_lance_cast_chance_per_cosmic_stack_max');
        }
    },
    50: {
        override: (effect) => {
            setStat(effect, 0, 'banner_radius_add_per_second');
        }
    },
    52: {
        override: (effect) => {
            setStat(effect, 0, 'revengeance_stack_thorns_percent');
            setStat(effect, 1, 'revengeance_stack_retaliate_percent');
            setStat(effect, 2, 'revengeance_stack_duration');
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
        }
    },
    56: {
        override: (effect) => {
            setStat(effect, 0, 'additional_wandering_arrow_add');
        }
    },
    57: {
        override: (effect) => {
            addConstant(effect, 4, <string><any>null, EffectValueValueType.Stat);
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
            addConstant(effect, 5, 'trap_pull_distance', EffectValueValueType.Stat);
        }
    },
    63: {
        override: (effect) => {
            setStat(effect, 0, 'elemental_weakness_stack_chance');
            setStat(effect, 1, 'elemental_weakness_stack_elemental_damage_mult');
            setStat(effect, 2, 'elemental_weakness_stack_duration');
            setStat(effect, 3, 'elemental_weakness_max_stacks');
        }
    },
    64: {
        override: (effect) => {
            setStat(effect, 0, 'book_smash_trigger_count_on_critical');
        }
    },
    65: {
        override: (effect) => {
            setStat(effect, 0, 'rift_nova_autocast_chance');
            setStat(effect, 1, 'rift_nova_autocast_tick');
        }
    },
    67: {
        override: (effect) => {
            addConstant(effect, 1, 'disable_orb_arcane_master_maluses', EffectValueValueType.Stat);
        }
    },
    69: {
        override: (effect) => {
            setStat(effect, 0, 'time_lock_damage_max_health_percent_treshold');
            addConstant(effect, 2.6, 'distortion_wave_push_distance', EffectValueValueType.AreaOfEffect);
        }
    },
    70: {
        override: (effect) => {
            setStat(effect, 0, 'time_lock_damage_max_health_percent_treshold');
            setStat(effect, 1, 'time_lock_damage_max_health_percent_increased_damage_mult');
        }
    },
    72: {
        override: (effect) => {
            setStat(effect, 0, 'arcane_bond_duration_add');
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
            setStat(effect, 1, 'high_voltage_stack_spark_machine_increased_damage');
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
    81: {
        override: (effect) => {
            effect.template = effect.template.substring(0, effect.template.indexOf('|'));
        }
    },
    83: {
        override: (effect) => {
            setStat(effect, 0, 'min_reaper_level');
        }
    },
}