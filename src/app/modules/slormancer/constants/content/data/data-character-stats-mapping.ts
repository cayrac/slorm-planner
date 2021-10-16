import { CharacterConfig } from '../../../model/character-config';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { ExtractedStatMap } from '../../../services/content/slormancer-stats-extractor.service';
import { valueOrDefault } from '../../../util/utils';
import { DELIGHTED_VALUE } from '../../common';

function getFirstStat(stats: ExtractedStatMap, stat: string, defaultValue: number = 0): number {
    const found = stats[stat];

    return found ? valueOrDefault(found[0], defaultValue) : defaultValue;
}

function getMaxStat(stats: ExtractedStatMap, stat: string): number {
    return Math.max(0, ...valueOrDefault(stats[stat], []));
}

function hasStat(stats: ExtractedStatMap, stat: string): boolean {
    return stats[stat] !== undefined;
}

export interface MergedStatMappingSource {
    stat: string;
    condition?: (config: CharacterConfig, stats: ExtractedStatMap) => boolean
    multiplier?: (config: CharacterConfig, stats: ExtractedStatMap) => number
};

const CHANCE_TO_PIERCE: MergedStatMapping = {
    stat: 'chance_to_pierce',
    precision: 1,
    allowMinMax: false,
    source: {
        flat: [
            { stat: 'chance_to_pierce_percent' },
            { stat: 'chance_to_pierce_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
            { stat: 'chance_to_pierce_percent_if_fully_charged', condition: (config) => config.void_arrow_fully_charged },
            { stat: 'chance_to_pierce_percent_if_fortunate_of_perfect', condition: (config) => config.next_cast_is_fortunate || config.next_cast_is_perfect },
            { stat: 'chance_to_pierce_percent_if_projectile_passed_through_wall_of_omen', condition: (config, stats) => config.projectile_passed_through_wall_of_omen && hasStat(stats, 'skill_is_projectile') },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [],
        maxMultiplier: [],
    } 
}

export interface MergedStatMapping {
    stat: string;
    precision: number;
    allowMinMax: boolean;
    source: {
        flat: Array<MergedStatMappingSource>;
        max: Array<MergedStatMappingSource>;
        percent: Array<MergedStatMappingSource>;
        maxPercent: Array<MergedStatMappingSource>;
        multiplier: Array<MergedStatMappingSource>;
        maxMultiplier: Array<MergedStatMappingSource>;
    }
}

export const GLOBAL_MERGED_STATS_MAPPING: Array<MergedStatMapping> = [
    // adventure
    {
        stat: 'level',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'hero_level' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_cost',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'mana_cost_add' },
                { stat: 'mana_cost_reduction_per_bleed', condition: config => config.enemy_bleed_stacks > 0, multiplier: config => config.enemy_bleed_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'all_skill_mana_cost_reduction_per_cast', condition: config => config.skill_cast_recently > 0, multiplier: config => -config.skill_cast_recently },
                { stat: 'aura_elemental_swap_mana_cost_increase' },
                { stat: 'last_cast_tormented_increased_cost', condition: config => config.last_cast_tormented },
                { stat: 'arrow_shot_void_arrow_heavy_explosive_increased_mana_cost', condition: (_, stats) => [3, 4, 6].includes(getFirstStat(stats, 'skill_id', 0)) },
                { stat: 'mana_cost_mult' },
                { stat: 'mana_cost_mult_if_tormented', condition: config => config.serenity === 0 },
                { stat: 'mana_cost_reduction_mult', multiplier: () => -1 },
                { stat: 'mana_cost_mult_per_enemy_under_control', condition: config => config.enemy_under_command > 0 || config.elite_under_command > 0, multiplier: config => config.enemy_under_command + config.elite_under_command * 10 },
                { stat: 'cost_reduction_mult_per_arcanic_emblem_if_not_arcanic', condition: (config, stats) => config.arcanic_emblems > 0 && !hasStat(stats, 'skill_is_arcanic'), multiplier: config => - config.arcanic_emblems },
                { stat: 'mana_cost_mult_if_low_mana', condition: (config, stats) => (100 - config.percent_missing_mana) < getFirstStat(stats, 'mana_cost_mult_if_low_mana_treshold') },
                { stat: 'mana_cost_reduction_mult_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => - config.arcanic_emblems },
                { stat: 'mana_cost_mult_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'cooldown_time',
        precision: 4,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'cooldown_time_add' },
                { stat: 'orb_arcane_master_cooldown_time_add', condition: (_, stats) => !hasStat(stats, 'disable_orb_arcane_master_maluses') },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'cooldown_time_multiplier'},
                { stat: 'cooldown_time_reduction_multiplier', multiplier: () => -1 },
                { stat: 'cooldown_time_multiplier_if_tormented', condition: config => config.serenity === 0 },
                { stat: 'grappling_hook_crest_shield_cooldown_time_reduction_multiplier', condition: (_, stats) => [7, 8].includes(getFirstStat(stats, 'skill_id')), multiplier: () => -1 },
                {
                    stat: 'quick_silver_cooldown_time_reduction_multiplier',
                    multiplier: (config, stats) => - Math.max(getFirstStat(stats, 'quick_silver_min_cooldown_time_reduction_multiplier'), getFirstStat(stats, 'quick_silver_max_cooldown_time_reduction_multiplier') - config.enemy_bleed_stacks)
                },
                { stat: 'cooldown_time_multiplier_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
                { stat: 'cooldown_time_reduction_multiplier_per_temporal_emblem_if_not_temporal', condition: (config, stats) => config.temporal_emblems > 0 && !hasStat(stats, 'skill_is_temporal'), multiplier: config => - config.temporal_emblems },
                { stat: 'cooldown_time_reduction_multiplier_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => - config.temporal_emblems },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'essence_find',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'essence_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'xp_find',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'xp_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'xp_find_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'influence_gain',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'influence_gain_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mf_find',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mf_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mf_qual',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mf_qual_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    // max_health
    {
        stat: 'max_health',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'the_max_health_set' },
                { stat: 'the_max_health_add', condition: (_, stats) => stats['the_max_health_set'] === undefined }
            ],
            max: [],
            percent: [
                { stat: 'the_max_health_percent', condition: (_, stats) => stats['the_max_health_set'] === undefined },
                { stat: 'the_max_health_percent_per_totem',
                    condition: (config, stats) => config.totems_under_control > 0 && stats['the_max_health_set'] === undefined,
                    multiplier: config => config.totems_under_control
                },
                { stat: 'vitality_stack_the_max_health_percent', condition: config => config.vitality_stacks > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'vitality_max_stack'), config.vitality_stacks) },
            ],
            maxPercent: [],
            multiplier: [{ stat: 'the_max_health_global_mult', condition: (_, stats) => stats['the_max_health_set'] === undefined }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'health_regeneration',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'health_regen_add' }],
            max: [],
            percent: [{ stat: 'health_regen_percent' }],
            maxPercent: [],
            multiplier: [{ stat: 'health_recovery_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'health_leech_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'health_leech_percent' },
                { stat: 'health_leech_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'health_leech_percent_on_low_life_treshold', 0)) },
                { stat: 'health_leech_percent_if_perfect', condition: config => config.next_cast_is_perfect },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'health_recovery_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'life_on_hit',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'health_on_hit_add' },
                { stat: 'health_on_hit_add_after_crit', condition: config => config.crit_recently },
                { stat: 'banner_regeneration_buff_health_on_hit_add', condition: config => config.has_banner_regeneration_buff },
            ],
            max: [],
            percent: [{ stat: 'health_on_hit_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'health_on_hit_global_mult' },
                { stat: 'health_recovery_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'health_on_kill_add' }],
            max: [],
            percent: [{ stat: 'health_on_kill_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'health_on_kill_global_mult' },
                { stat: 'health_recovery_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    // max_mana
    {
        stat: 'max_mana',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'the_max_mana_add' }],
            max: [],
            percent: [
                { stat: 'the_max_mana_percent' },
                { stat: 'chrono_manamorphosis_stack_the_max_mana_percent', condition: config => config.chrono_manamorphosis_stacks > 0, multiplier: (config, stats) => Math.min(config.chrono_manamorphosis_stacks, getFirstStat(stats, 'chrono_manamorphosis_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks')) },
                { stat: 'the_max_mana_percent_per_enemy_in_breach_range', condition: config => config.enemies_in_breach_range > 0, multiplier: config => config.enemies_in_breach_range },
            ],
            maxPercent: [],
            multiplier: [{ stat: 'the_max_mana_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_regeneration',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'mana_regen_add' },
                { stat: 'mana_regen_add_if_delighted_and_enemy_has_latent_storm', condition: config => config.serenity === DELIGHTED_VALUE && config.enemies_affected_by_latent_storm > 0 },
                { stat: 'mana_regen_add_per_enemy_in_breach_range', condition: config => config.enemies_in_breach_range > 0, multiplier: config => config.enemies_in_breach_range },
            ],
            max: [],
            percent: [{ stat: 'mana_regen_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'mana_regen_global_mult' },
                { stat: 'smoke_screen_buff_mana_regen_global_mult', condition: config => config.has_smoke_screen_buff }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_leech_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mana_leech_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_on_hit',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'mana_on_hit_add' },
                { stat: 'banner_regeneration_buff_mana_on_hit_add', condition: config => config.has_banner_regeneration_buff },
                { stat: 'mana_on_hit_add_if_target_has_arcanic_discordance', condition: config => config.target_has_arcane_discordance },
            ],
            max: [],
            percent: [{ stat: 'mana_on_hit_percent' }],
            maxPercent: [],
            multiplier: [{ stat: 'mana_on_hit_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_on_kill',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'mana_on_kill_add' },
                { stat: 'arrow_shot_mana_on_kill_add', condition: (_, stats) => getFirstStat(stats, 'skill_id') === 3 }
            ],
            max: [],
            percent: [{ stat: 'mana_on_kill_percent' }],
            maxPercent: [],
            multiplier: [{ stat: 'mana_on_kill_global_mult' }],
            maxMultiplier: [],
        } 
    },
    // movement
    {
        stat: 'movement_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'the_speed_add' }],
            max: [],
            percent: [
                { stat: 'the_speed_percent' },
                { stat: 'the_speed_percent_after_dodge', condition: config => config.dodge_recently },
                { stat: 'assassin_haste_buff_movement_speed', condition: config => config.has_assassin_haste_buff },
                { stat: 'tormented_movement_speed', condition: config => config.serenity === 0 },
                { stat: 'movement_speed_after_trap_triggered', condition: config => config.trap_triggered_recently },
                { stat: 'the_speed_percent_per_latent_storm', condition: config => config.enemies_affected_by_latent_storm > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'the_speed_percent_per_latent_storm_max'), config.enemies_affected_by_latent_storm) },
                { stat: 'speed_gate_buff_the_speed_percent', condition: config => config.has_speed_gate_buff },
            ],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'movement_speed_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [               
                { stat: 'the_speed_percent' },
                { stat: 'the_speed_percent_after_dodge', condition: config => config.dodge_recently },
                { stat: 'assassin_haste_buff_movement_speed', condition: config => config.has_assassin_haste_buff },
                { stat: 'tormented_movement_speed', condition: config => config.serenity === 0 },
                { stat: 'movement_speed_after_trap_triggered', condition: config => config.trap_triggered_recently },
                { stat: 'the_speed_percent_per_latent_storm', condition: config => config.enemies_affected_by_latent_storm > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'the_speed_percent_per_latent_storm_max'), config.enemies_affected_by_latent_storm) },
                { stat: 'speed_gate_buff_the_speed_percent', condition: config => config.has_speed_gate_buff },],
            max: [],
            percent: [
            ],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    // Attack
    {
        stat: 'attack_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'cooldown_reduction_percent' },
                { stat: 'turret_syndrome_reduced_cooldown_per_serenity', condition: config => config.serenity > 0, multiplier: config => config.serenity }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'adam_blessing_buff_cooldown_reduction_global_mult', condition: config => config.has_adam_blessing_buff },
                { stat: 'cooldown_reduction_global_mult' },
                { stat: 'cooldown_reduction_global_mult_after_crit', condition: config => config.crit_recently },
                { stat: 'self_control_cooldown_reduction_global_mult', condition: config => config.serenity > 0 && config.serenity < DELIGHTED_VALUE },
                { stat: 'delightful_rain_stack_cooldown_reduction_global_mult', condition: config => config.delightful_rain_stacks > 0, multiplier: (config, stats) => Math.min(config.delightful_rain_stacks, getFirstStat(stats, 'delightful_rain_max_stacks')) },
                { stat: 'exhilerating_senses_stack_cooldown_reduction_global_mult', condition: config => config.exhilerating_senses_stacks > 0, multiplier: config => config.exhilerating_senses_stacks },
                { stat: 'banner_haste_buff_cooldown_reduction_global_mult', condition: config => config.has_banner_haste_buff },
                { stat: 'frenzy_stack_cooldown_reduction_global_mult', condition: config => config.frenzy_stacks > 0, multiplier: (config, stats) => Math.min(config.frenzy_stacks, getFirstStat(stats, 'frenzy_max_stacks')) },
                { stat: 'arcane_clone_cooldown_reduction_global_mult', condition: (_, stats) => hasStat(stats, 'cast_by_clone' )},
                { stat: 'arcane_clone_cooldown_reduction_global_mult_if_in_breach', condition: (config, stats) => hasStat(stats, 'cast_by_clone') && config.clone_is_in_breach_range },
                { stat: 'chrono_speed_stack_cooldown_reduction_global_mult', condition: config => config.chrono_speed_stacks > 0, multiplier: (config, stats) => Math.min(config.chrono_speed_stacks, getFirstStat(stats, 'chrono_speed_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks')) },
                { stat: 'arcane_flux_stack_cooldown_reduction_global_mult', condition: config => config.arcane_flux_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_flux_stacks, getFirstStat(stats, 'arcane_flux_max_stacks')) },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'enemy_attack_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'enemy_cooldown_reduction_percent' },
                { stat: 'inextricable_torment_aura_enemy_cooldown_reduction_percent' },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'aura_air_conditionner_enemy_cooldown_reduction_global_mult' },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'enemy_damage',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'inextricable_torment_aura_enemy_increased_damage', multiplier: () => -1 },
                { stat: 'poisoned_enemy_increased_damage', condition: config => config.enemy_is_poisoned, multiplier: () => -1 },
                { stat: 'military_oppression_enemy_increased_damage', condition: config => config.enemy_has_military_oppression, multiplier: () => -1 },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'crit_chance_percent' },
                { stat: 'crit_chance_percent_if_no_enemies_around', condition: config => config.ennemies_in_radius === 0 },
                { stat: 'greed_stack_crit_chance_percent', condition: config => config.greed_stacks > 0, multiplier: config => config.greed_stacks },
                { stat: 'strider_stack_crit_chance_percent', condition: config => config.strider_stacks > 0, multiplier: config => config.strider_stacks },
                { stat: 'ancestral_fervor_buff_crit_chance_percent', condition: config => config.has_ancestral_fervor_buff },
                { stat: 'nimble_buff_crit_chance_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'last_cast_tormented_crit_chance_percent', condition: config => config.last_cast_tormented },
                { stat: 'smoke_screen_buff_crit_chance_percent', condition: config => config.has_smoke_screen_buff },
                { stat: 'crit_chance_percent_per_enemy_in_aoe', condition: config => config.enemies_in_rain_of_arrow > 0, multiplier: config => config.enemies_in_rain_of_arrow },
                { stat: 'blademaster_crit_chance_percent', multiplier: (_, stats) => [3, 9].includes(getFirstStat(stats, 'primary_skill', -1)) || [3, 9].includes(getFirstStat(stats, 'secondary_skill', -1)) ? 2 : 1 },
                { stat: 'crit_chance_percent_if_target_is_time_locked', condition: config => config.target_is_time_locked },
                { stat: 'crit_chance_percent_if_book_smash_or_chrono_puncture', condition: (_, stats) => [5, 7].includes(getFirstStat(stats, 'skill_id')) },
                { stat: 'remnant_crit_chance_percent', condition: config => config.is_remnant },
                { stat: 'crit_chance_percent_if_obliteration', condition: (_, stats) => hasStat(stats, 'skill_is_obliteration') },
                { stat: 'crit_chance_percent_per_same_emblems', multiplier: (config, stats) => hasStat(stats, 'skill_is_temporal') ? config.temporal_emblems : hasStat(stats, 'skill_is_arcanic') ? config.arcanic_emblems : config.obliteration_emblems },
                { stat: 'crit_chance_percent_if_remnant_and_target_in_breach', condition: config => config.is_remnant && config.target_is_in_breach_range },
                { stat: 'crit_chance_percent_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'crit_chance_global_mult_after_hit_taken', condition: config => config.took_physical_damage_recently || config.took_elemental_damage_recently },
                { stat: 'enemy_full_life_crit_chance_global_mult', condition: (config, stats) => config.use_enemy_state && (100 - config.enemy_percent_missing_health) >= getFirstStat(stats, 'enemy_full_life_crit_chance_global_mult_treshold', 0) },
                { stat: 'crit_chance_global_mult_per_yard', condition: config => config.use_enemy_state && config.distance_with_target > 0, multiplier: config => config.distance_with_target },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'critical_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'crit_damage_percent' },
                { stat: 'crit_damage_percent_for_each_ennemy', condition: config => config.ennemies_in_radius > 0, multiplier: config => config.ennemies_in_radius },
                { stat: 'nimble_buff_crit_damage_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'burning_shadow_buff_crit_damage_percent', condition: config => config.has_burning_shadow_buff },
                { stat: 'mighty_swing_cadence_whirlwind_crit_damage_percent', condition: (_, stats) => [3, 6, 9].includes(getFirstStat(stats, 'skill_id')) },
                { stat: 'crit_damage_percent_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
                { stat: 'crit_damage_percent_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'crit_damage_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ancestral_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'brut_chance_percent' },
                { stat: 'ancestral_legacy_stack_brut_chance_percent',
                    condition: config => config.ancestral_legacy_stacks > 0,
                    multiplier: (config, stats) => config.ancestral_legacy_stacks
                },
                { stat: 'nimble_buff_brut_chance_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                },
                {
                    stat: 'ancestral_stab_slash_buff_brut_chance_percent',
                    condition: config => config.has_ancestral_stab_slash_buff, 
                },
                { stat: 'brut_chance_percent_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => config.temporal_emblems },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ancestral_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'brut_damage_percent' },
                { stat: 'nimble_buff_brut_damage_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'armor_penetration',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'armor_penetration_percent' },
                { stat: 'idle_armor_penetration_percent', condition: config => config.idle },
                
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_penetration',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'elemental_penetration_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'dot_increased_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'dot_increased_damage_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'increased_on_elite',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'increased_damage_on_elite_percent' },
                { stat: 'increased_damage_on_elite_percent_for_each_elite', condition: config => config.elites_in_radius > 0 , multiplier: config => config.elites_in_radius }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'armor',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'res_phy_add' }],
            max: [],
            percent: [
                { stat: 'res_phy_percent' },
                { stat: 'res_phy_percent_per_banner', condition: config => config.banners_nearby > 0, multiplier: config => config.banners_nearby },
                { stat: 'oak_bark_armor_stack_res_phy_percent', condition: config => config.oak_bark_armor_stacks > 0, multiplier: (config, stats) => Math.min(config.oak_bark_armor_stacks, getFirstStat(stats, 'oak_bark_armor_max_stack')) },
                { stat: 'res_phy_percent_if_channeling_ray_of_obliteration', condition: config => config.is_channeling_ray_of_obliteration },
                { stat: 'chrono_armor_stack_res_phy_percent', condition: config => config.chrono_armor_stacks > 0, multiplier: (config, stats) => Math.min(config.chrono_armor_stacks, getFirstStat(stats, 'chrono_armor_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks')) },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'res_phy_global_mult' },
                { stat: 'res_phy_global_mult_on_low_life',condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'res_phy_global_mult_on_low_life_treshold', 0)) },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_resist',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'res_mag_add' },
                { stat: 'aura_neriya_shield_res_mag_add' }
            ],
            max: [],
            percent: [
                { stat: 'res_mag_percent' },
                { stat: 'res_mag_percent_if_channeling_ray_of_obliteration', condition: config => config.is_channeling_ray_of_obliteration },

            ],
            maxPercent: [],
            multiplier: [
                { stat: 'res_mag_global_mult' },
                { stat: 'res_mag_global_mult_after_elemental_damage_taken', condition: config => config.took_elemental_damage_recently },
                { stat: 'res_mag_global_mult_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'fire_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'fire_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ice_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'ice_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'lightning_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'lightning_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'light_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'light_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'shadow_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'shadow_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'dodge',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'dodge_add' }],
            max: [],
            percent: [
                { stat: 'dodge_percent' },
                { stat: 'turret_syndrome_on_cooldown_dodge_percent', condition: config => config.turret_syndrome_on_cooldown }
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'dodge_global_mult' },
                { stat: 'assassin_haste_buff_dodge_global_mult', condition: config => config.has_assassin_haste_buff },
                { stat: 'dodge_global_mult_if_delighted', condition: config => config.serenity === DELIGHTED_VALUE }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'thorns',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'thorns_add' }],
            max: [],
            percent: [
                { stat: 'thorns_percent' },
                { stat: 'thorns_percent_on_blocked_hit', condition: config => config.is_hit_blocked },
                { stat: 'revengeance_stack_thorns_percent', condition: config => config.revengeance_stacks > 0, multiplier: config => config.revengeance_stacks },
            ],
            maxPercent: [],
            multiplier: [{ stat: 'thorns_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'thorns_critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'thorn_crit_chance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'idle_thorn_crit_chance_global_mult', condition: config => config.idle }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'retaliate',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'retaliate_percent' },
                { stat: 'retaliate_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'retaliate_percent_on_low_life_treshold', 0)) },
                { stat: 'golden_buff_retaliate_percent', condition: config => config.has_gold_armor_buff },
                { stat: 'retaliate_percent_on_blocked_hit', condition: config => config.is_hit_blocked },
                { stat: 'retaliate_percent_if_channeling_arcane_barrier', condition: config => config.is_channeling_arcane_barrier },
                { stat: 'revengeance_stack_retaliate_percent', condition: config => config.revengeance_stacks > 0, multiplier: config => config.revengeance_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'retaliate_critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'retaliate_crit_chance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'tenacity',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'tenacity_percent' },
                { stat: 'tenacity_percent_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_all',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'reduced_damage_from_all_percent' },
                { stat: 'reduced_damage_from_all_percent_after_hit_taken',
                    condition: config => config.hits_taken_recently > 0,
                    multiplier: (config, stats) => Math.min(config.hits_taken_recently, getFirstStat(stats, 'reduced_damage_from_all_percent_after_hit_taken_max_stack', 0))
                },
                { stat: 'golden_buff_reduced_damage_from_all_percent', condition: config => config.has_gold_armor_buff },
                { stat: 'stability_stack_reduced_on_all', condition: config => config.stability_stacks > 0, multiplier: (config, stats) => Math.min(config.stability_stacks, getFirstStat(stats, 'stability_max_stacks', 0)) }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_by_elite',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'reduced_damage_on_elite_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'reduced_damage_from_melee_percent' },
                { stat: 'reduced_damage_from_melee_percent_for_each_ennemy', condition: config => config.ennemies_in_radius > 0, multiplier: config => config.ennemies_in_radius },
                { stat: 'reduced_damage_from_melee_percent_if_source_is_full_life', condition: config => config.use_enemy_state && config.enemy_percent_missing_health === 0 },
                { stat: 'melee_defense_stack_reduction', condition: config => config.melee_defense_stacks > 0, multiplier: config => config.melee_defense_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'reduced_damage_from_projectile_percent' },
                { stat: 'projectile_defense_stack_reduction', condition: config => config.projectile_defense_stacks > 0, multiplier: config => config.projectile_defense_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_area',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'reduced_damage_from_area_percent' },
                { stat: 'enduring_protector_buff_reduced_damage_from_area_percent', condition: config => config.has_enduring_protector_buff },
                { stat: 'aoe_defense_stack_reduction', condition: config => config.aoe_defense_stacks > 0, multiplier: config => config.aoe_defense_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'gold_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'gold_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'gold_find_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'scrap_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'scrap_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'slormite_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'slormite_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'slormeline_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'slormeline_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reaper_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'reaper_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reaper_xp_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'reaper_xp_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'skill_mastery_gain',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'skill_mastery_gain_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'inner_fire_chance_percent' },
                { stat: 'inner_fire_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_max_number',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'inner_fire_max_number_add' },
                { stat: 'conquest_stack_inner_fire_max_number_add', condition: config => config.conquest_stacks > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'conquest_max_stacks', 0), config.conquest_stacks) }
            ],
            max: [],
            percent: [{ stat: 'inner_fire_max_number_percent' }],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_duration',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'inner_fire_duration_add' }],
            max: [],
            percent: [{ stat: 'inner_fire_duration_percent' }],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_damage',
        precision: 3,
        allowMinMax: true,
        source: {
            flat: [
                { stat: 'inner_fire_damage_add' },
                { stat: 'overdrive_inner_fire_additional_damage' },
            ],
            max: [],
            percent: [
                { stat: 'inner_fire_damage_percent' },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'inner_fire_damage_mult_if_channeling_whirlwind', condition: (config, stats) => config.is_channeling_whirlwind && !hasStat(stats, 'no_longer_cost_per_second') }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'shield_globe_value',
        precision: 3,
        allowMinMax: true,
        source: {
            flat: [
                { stat: 'shield_globe_value_add' },
            ],
            max: [],
            percent: [
            ],
            maxPercent: [],
            multiplier: [
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'overdrive_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'overdrive_chance_percent' },
                { stat: 'overdrive_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
                { stat: 'overdrive_chance_percent_if_next_cast_is_new_emblem', condition: (config, stats) => config.next_cast_is_new_emblem && hasStat(stats, 'skill_is_melee') },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'overdrive_bounce_number',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'overdrive_bounce_number_add', condition: (config, stats) => stats['overdrive_bounce_number_set'] === undefined },
                { stat: 'overdrive_bounce_number_set' }
            ],
            max: [],
            percent: [{ stat: 'overdrive_bounce_number_percent', condition: (config, stats) => stats['overdrive_bounce_number_set'] === undefined }],
            maxPercent: [],
            multiplier: [{ stat: 'overdrive_bounce_number_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'overdrive_damage',
        precision: 3,
        allowMinMax: true,
        source: {
            flat: [
                { stat: 'overdrive_damage_add' },
                { stat: 'overdrive_inner_fire_additional_damage' },
            ],
            max: [],
            percent: [{ stat: 'overdrive_damage_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'overdrive_damage_global_mult' },
                { stat: 'overdrive_damage_global_mult_per_bounce_left', condition: config => config.overdrive_bounces_left > 0, multiplier: config => config.overdrive_bounces_left },
                { stat: 'overdrive_damage_global_mult_last_bounce', condition: config => config.overdrive_last_bounce }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'recast_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'recast_chance_percent' },
                { stat: 'recast_chance_percent_if_perfect', condition: config => config.next_cast_is_perfect },
                { stat: 'recast_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
                { stat: 'recast_chance_percent_per_non_obliteration_emblem', condition: config => (config.arcanic_emblems + config.temporal_emblems) > 0, multiplier: config => config.arcanic_emblems + config.temporal_emblems },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'knockback_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'knockback_melee_add' },
                { stat: 'knockback_melee_percent' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'additional_projectile',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'additional_projectile_add' },
                { stat: 'idle_additional_projectile_add', condition: config => config.idle },
                { stat: 'tormented_additional_projectile_add', condition: config => config.serenity === 0 },
                { stat: 'perfect_additional_projectile_add', condition: config => config.next_cast_is_perfect },
                { stat: 'additional_projectile_add_if_next_cast_is_new_emblem', condition: (config, stats) => config.next_cast_is_new_emblem && hasStat(stats, 'skill_is_projectile') },
                { stat: 'arcane_stack_additional_projectile_add', condition: config => config.arcane_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_stacks, getFirstStat(stats, 'arcane_max_stacks')) },
            ],
            max: [],
            percent: [{ stat: 'additional_projectile_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'idle_additional_projectile_global_mult', condition: config => config.idle },
                { stat: 'not_idle_additional_projectile_global_mult', condition: config => !config.idle },
            ],
            maxMultiplier: [],
        } 
    },
    CHANCE_TO_PIERCE,
    {
        stat: 'fork_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'fork_chance_percent' },
                { stat: 'fork_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'arrow_shot_fork_chance_percent', condition: (_, stats) => getFirstStat(stats, 'skill_id') === 3 },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'chance_to_rebound',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'rebound_chance_percent' },
                { stat: 'rebound_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'arrow_shot_rebound_chance_percent', condition: (_, stats) => getFirstStat(stats, 'skill_id') === 3 },
                { stat: 'rebound_chance_percent_if_fully_charged', condition: config => config.void_arrow_fully_charged },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'projectile_speed',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'increased_proj_speed_percent' },
                { stat: 'increased_proj_speed_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'increased_proj_speed_percent_if_tormented', condition: (config) => config.serenity === 0},
                { stat: 'increased_proj_speed_percent_if_projectile_passed_through_wall_of_omen', condition: (config, stats) => config.projectile_passed_through_wall_of_omen && hasStat(stats, 'skill_is_projectile')},
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'knockback_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'knockback_projectile_add' },
                { stat: 'knockback_projectile_percent' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'aoe_increased_size',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'aoe_increased_size_percent' },
                { stat: 'max_charged_aoe_increased_size_percent', condition: config => config.rift_nova_fully_charged },
                { stat: 'arcane_breach_collision_stack_aoe_increased_size_percent', condition: config => config.arcane_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_breach_collision_stacks, getFirstStat(stats, 'breach_collision_max_stacks')) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'aoe_increased_effect',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'aoe_increased_effect_percent' },
                { stat: 'aoe_increased_effect_percent_on_low_mana', condition: (config, stats) => config.percent_missing_mana > (100 - getFirstStat(stats, 'aoe_increased_effect_percent_on_low_mana_treshold', 0))  }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'totem_increased_effect',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'totem_increased_effect_percent' },
                { stat: 'totem_dexterity_totem_increased_effect_percent', condition: config => config.totem_dexterity_stacks > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'totem_dexterity_max_stack', 0), config.totem_dexterity_stacks) }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'aura_increased_effect',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'aura_increased_effect_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'minion_increased_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'minion_increased_damage_percent' },
                { stat: 'minion_increased_damage_percent_per_controlled_minion', condition: config => config.controlled_minions > 0, multiplier: config => config.controlled_minions },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [
                { stat: 'min_elemental_damage_add' },
                { stat: 'weapon_to_elemental_damage' },
                { stat: 'elemental_emergency_min_elemental_damage_add_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'elemental_emergency_min_elemental_damage_add_on_low_life_treshold', 0)) },
                { stat: 'enligntment_stack_min_elemental_damage_add', condition: config => config.enlightenment_stacks > 0, multiplier: config => Math.min(config.enlightenment_stacks, 999) }
            ],
            max: [{ stat: 'max_elemental_damage_add' }],
            percent: [
                { stat: 'elemental_damage_percent' },
                { stat: 'elemental_prowess_elemental_damage_percent', condition: config => config.has_elemental_prowess_buff },
                { stat: 'legendary_elemental_damage_percent', condition: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) > 0, multiplier: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) },
                { stat: 'elemental_temper_buff_elemental_damage_percent', condition: config => config.has_elemental_temper_buff },
                { stat: 'aura_elemental_swap_elemental_damage_percent' },
                { stat: 'elemental_damage_percent_for_each_negative_effect_on_ennemies', condition: config => config.negative_effects_on_ennemies_in_radius > 0, multiplier: config => config.negative_effects_on_ennemies_in_radius },
                { stat: 'invigorate_stack_elemental_damage_percent', condition: config => config.invigorate_stacks > 0, multiplier: (config, stats) => Math.min(config.invigorate_stacks, getFirstStat(stats, 'invigorate_max_stacks'))},
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'elemental_damage_mult' },
                { stat: 'elemental_damage_global_mult' },
                { stat: 'elemental_fervor_buff_elemental_damage_global_mult', condition: config => config.has_elemental_fervor_buff },
                { stat: 'elemental_weakness_stack_elemental_damage_mult',
                    condition: (config, stats) => config.elemental_weakness_stacks > 0 && hasStat(stats, 'skill_id') && [getFirstStat(stats, 'primary_skill'), getFirstStat(stats, 'secondary_skill')].includes(4),
                    multiplier: (config, stats) => Math.min(config.elemental_weakness_stacks, getFirstStat(stats, 'elemental_weakness_max_stacks')) },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'basic_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [
                { stat: 'min_basic_damage_add' },
                { stat: 'merchant_stack_min_basic_damage_add', condition: config => config.merchant_stacks > 0, multiplier: (config, stats) => Math.min(getFirstStat(stats, 'merchant_stack_max_stack', 0), config.merchant_stacks) }
            ],
            max: [{ stat: 'max_basic_damage_add' }],
            percent: [
                { stat: 'basic_damage_percent' },
                { stat: 'burning_shadow_buff_basic_damage_percent', condition: config => config.has_burning_shadow_buff }
            ],
            maxPercent: [{ stat: 'max_basic_damage_percent' }],
            multiplier: [
                { stat: 'basic_damage_percent_mult' },
                { stat: 'basic_damage_percent_global_mult' },
                { stat: 'basic_damage_global_mult' },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'weapon_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [{ stat: 'min_weapon_damage_add' }],
            max: [{ stat: 'max_weapon_damage_add' }],
            percent: [],
            maxPercent: [{ stat: 'max_weapon_damage_global_mult' }],
            multiplier: [
                { stat: 'weapon_damage_mult' },
                { stat: 'weapon_damage_mult_after_support_cast', condition: config => config.cast_support_before_next_cast }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'physical_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [{ stat: 'basic_to_physical_damage' }, { stat: 'weapon_to_physical_damage' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'physical_damage_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'sum_all_resistances',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [ { stat: 'sum_all_resistances_add'}],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'sum_reduced_resistances',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [ { stat: 'sum_reduced_resistances_add'}],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'skill_elem_damage',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [ { stat: 'skill_elem_damage_add'}],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'additional_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'additional_damage_add' },
                { stat: 'primary_skill_additional_damages', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') },
                { stat: 'primary_secondary_skill_additional_damage', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary') },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'increased_damages',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'nimble_buff_primary_skill_increased_damages',
                    condition: (config, stats) => config.has_nimble_buff && hasStat(stats, 'skill_is_equipped_primary'), 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'increased_damage_for_each_yard_with_target', condition: config => config.use_enemy_state && config.distance_with_target > 0, multiplier:  config => config.distance_with_target },
                { stat: 'primary_secondary_skill_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary')},
                { stat: 'melee_skill_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_melee') },
                { stat: 'lightning_imbued_skill_increased_damage', condition: (_, stats) => hasStat(stats, 'skill_lightning_imbued') },
                { stat: 'light_imbued_skill_increased_damage', condition: (_, stats) => hasStat(stats, 'skill_light_imbued') },
                { stat: 'light_arrow_increased_damage' },
                { stat: 'isolated_target_increased_damage', condition: config => config.use_enemy_state && config.target_is_isolated },
                { stat: 'negative_effect_target_increased_damage', condition: config => config.use_enemy_state && config.target_has_negative_effect },
                { stat: 'close_target_increased_damage', condition: (config, stats) => config.use_enemy_state && config.distance_with_target <= getFirstStat(stats, 'close_target_radius') },
                { stat: 'smoke_screen_buff_increased_damage', condition: config => config.has_smoke_screen_buff },
                { stat: 'increased_damage_per_rebound', condition: config => config.rebounds_before_hit > 0, multiplier: config => config.rebounds_before_hit },
                { stat: 'first_hit_after_rebound_increased_damage', condition: config => config.rebounds_before_hit > 0 && config.is_first_arrow_shot_hit },
                { stat: 'increased_damage_per_pierce', condition: config => config.pierces_before_hit > 0, multiplier: config => config.pierces_before_hit },
                { stat: 'increased_damage_mult' },
                { stat: 'decreased_damage', multiplier: () => -1 },
                { stat: 'increased_damage_per_volley_before', condition: config => config.is_last_volley, multiplier: (_, stats) => getFirstStat(stats, 'additional_volleys') },
                { stat: 'latent_storm_stack_increased_damage', condition: config => config.target_latent_storm_stacks > 0, multiplier: (config, stats) => Math.min(config.target_latent_storm_stacks, getFirstStat(stats, 'latent_storm_max_stacks')) },
                { stat: 'increased_damage_mult_if_fully_charged', condition: (config, stats) => config.void_arrow_fully_charged && hasStat(stats, 'max_charge'), multiplier: (_, stats) => getMaxStat(stats, 'max_charge') },
                { stat: 'increased_damage_mult_per_target_left_health_percent', condition: config => config.use_enemy_state && config.enemy_percent_missing_health < 100, multiplier: config => 100 - config.enemy_percent_missing_health },
                { stat: 'increased_damage_mult_per_target_missing_health_percent', condition: config => config.use_enemy_state && config.enemy_percent_missing_health > 0, multiplier: config => config.enemy_percent_missing_health },
                { stat: 'increased_damage_if_target_is_skewered', condition: config => config.target_is_skewered },
                { stat: 'increased_damage_if_not_fortunate_or_perfect', condition: config => !config.next_cast_is_fortunate && !config.next_cast_is_perfect },
                { stat: 'chivalry_low_life_reduced_damage', condition: (config, stats) => config.use_enemy_state && getFirstStat(stats, 'chivalry_low_life_treshold') > (100 - config.enemy_percent_missing_health), multiplier: () => -1 },
                { stat: 'chivalry_high_life_increased_damage', condition: (config, stats) => config.use_enemy_state && getFirstStat(stats, 'chivalry_high_life_treshold') < (100 - config.enemy_percent_missing_health) },
                { stat: 'increased_damage_mult_if_no_legendaries', condition: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries') === 0 },
                { stat: 'increased_damage_mult_on_splintered_enemy', condition: config => config.enemy_splintered_stacks > 0, multiplier: (config, stats) => 1 + Math.max(0, Math.min(config.enemy_splintered_stacks, getFirstStat(stats, 'splintered_max_stacks', 1)) - 1) * getFirstStat(stats, 'splintered_stack_increased_effect') / 100 },
                { stat: 'increased_damage_if_fortunate_or_perfect', condition: config => config.next_cast_is_fortunate || config.next_cast_is_perfect },
                { stat: 'increased_damage_mult_if_target_is_time_locked', condition: config => config.target_is_time_locked },
                { stat: 'remnant_damage_reduction_mult', condition: config => config.is_remnant },
                { stat: 'remnant_increased_damage_mult', condition: config => config.is_remnant },
                { stat: 'remnant_vulnerability_remnant_increased_damage_mult', condition: config => config.is_remnant && config.target_has_remnant_vulnerability },
                { stat: 'increased_damage_mult_per_inner_fire', condition: config => config.active_inner_fire > 0, multiplier: config => config.active_inner_fire },
            ],
            maxMultiplier: [
            ],
        } 
    },
    {
        stat: 'skill_increased_damages',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'skill_decreased_damage_mult', multiplier: () => -1 },
                { stat: 'skill_increased_damage_mult' },
                { stat: 'skill_and_enemy_under_control_increased_damage_mult' },
                { stat: 'skill_increased_damage_mult_against_broken_armor', condition: config => config.use_enemy_state && config.target_has_broken_armor },
                { stat: 'skill_increased_damage_mult_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
                { stat: 'skill_increased_damage_mult_per_second_while_channeling_whirlwind',
                    condition: (config, stats) => config.is_channeling_whirlwind && config.time_spend_channeling > 0 && !hasStat(stats, 'no_longer_cost_per_second'),
                    multiplier: (config, stats) => Math.min(config.time_spend_channeling, Math.round(getFirstStat(stats, 'skill_increased_damage_mult_max_while_channeling_whirlwind') / getFirstStat(stats, 'skill_increased_damage_mult_per_second_while_channeling_whirlwind'))),
                },
                { stat: 'increased_damage_mult_per_obliteration_emblem_if_not_obliteration', condition: (config, stats) => config.obliteration_emblems > 0 && !hasStat(stats, 'skill_is_obliteration'), multiplier: config => config.obliteration_emblems },
                { stat: 'skill_melee_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_melee') },
                { stat: 'skill_projectile_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_projectile') },
                { stat: 'skill_aoe_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_aoe') },
                { stat: 'skill_increased_damage_mult_per_grow', condition: config => config.ray_of_obliteration_grow_stacks > 0, multiplier: (config, stats) => Math.min(config.ray_of_obliteration_grow_stacks, getFirstStat(stats, 'max_grow')) },
                { stat: 'skill_increased_damage_mult_if_short', condition: config => config.ray_of_obliteration_is_short },
                { stat: 'high_spirit_stacks_skill_increased_damage_mult', condition: config => config.high_spirit_stacks > 0, multiplier: config => config.high_spirit_stacks },
                { stat: 'skill_increased_damage_mult_per_non_temporal_emblem', condition: config => (config.arcanic_emblems + config.obliteration_emblems) > 0, multiplier: config => config.arcanic_emblems + config.obliteration_emblems },
                { stat: 'chrono_pucture_skill_increased_damage_mult', condition: config => config.is_remnant, multiplier: () => 2 },
                { stat: 'chrono_empower_stack_skill_increased_damage_mult',
                    condition: (config, stats) => config.chrono_empower_stacks > 0
                            && (
                                (hasStat(stats, 'chrono_puncture_is_obliteration') && (hasStat(stats, 'skill_is_temporal') || hasStat(stats, 'skill_is_arcanic') ))
                                || (!hasStat(stats, 'chrono_puncture_is_obliteration') && (hasStat(stats, 'skill_is_obliteration') || hasStat(stats, 'skill_is_arcanic') ))
                            ),
                    multiplier: (config, stats) => Math.min(config.chrono_empower_stacks, getFirstStat(stats, 'chrono_empower_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks'))
                },
                { stat: 'traumatized_stack_double_damages', condition: config => config.enemy_traumatized_stacks > 0, multiplier: (config, stats) => Math.pow(2, Math.min(config.enemy_traumatized_stacks, getFirstStat(stats, 'traumatized_max_stacks'))) },
                { stat: 'obliteration_breach_stack_skill_increased_damage_mult', condition: config => config.obliteration_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.obliteration_breach_collision_stacks, getFirstStat(stats, 'breach_collision_max_stacks')) },
                { stat: 'skill_increased_damage_mult_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
                { stat: 'orb_arcane_master_skill_decreased_damage_mult', condition: (_, stats) => !hasStat(stats, 'disable_orb_arcane_master_maluses'), multiplier: () => -1 },
                { stat: 'skill_decreased_damage_mult_if_only_obliteration', condition: config => config.temporal_emblems === 0 && config.arcanic_emblems === 0 },
            ],
            maxMultiplier: [
                { stat: 'skill_increased_max_damage_mult' },
            ],
        } 
    },
    {
        stat: 'increased_damage_taken',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'no_gold_armor_buff_increased_damage_taken_mult', condition: config => !config.has_gold_armor_buff }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'skill_additional_duration',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'skill_duration_add' },
                { stat: 'skill_duration_reduction', multiplier: () => -1 },
                { stat: 'skill_duration_reduction_if_tormented', condition: config => config.serenity === 0, multiplier: () => -1 },
                { stat: 'temporal_breach_collision_stack_duration_add', condition: config => config.temporal_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.temporal_breach_collision_stacks, getFirstStat(stats, 'breach_collision_max_stacks')) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
];

export const HERO_MERGED_STATS_MAPPING: GameHeroesData<Array<MergedStatMapping>> = {
    0: [
        {
            stat: 'skewer_max_stacks',
            precision: 0,
            allowMinMax: false,
            source: {
                flat: [{ stat: 'skewer_max_stack_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'skewer_damage_percent',
            precision: 0,
            allowMinMax: false,
            source: {
                flat: [{ stat: 'skewer_damage_percent_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'block_damage_reduction',
            precision: 0,
            allowMinMax: false,
            source: {
                flat: [{ stat: 'block_damage_reduction_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'astral_retribution_damage',
            precision: 3,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'astral_retribution_damage_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [{ stat: 'astral_retribution_increased_damage_mult' }],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'astral_meteor_damage',
            precision: 3,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'astral_meteor_damage_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'astral_retribution_increased_damage_mult' },
                    { stat: 'astral_meteor_increased_damage_mult' }
                ],
                maxMultiplier: [],
            } 
        }
    ],
    1: [
        {
            stat: 'ravenous_dagger_damage',
            precision: 3,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'ravenous_dagger_damage_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'trap_damage',
            precision: 3,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'trap_damage_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'trap_increased_damage_percent', condition: config => config.traps_nearby > 0, multiplier: config => config.traps_nearby },
                    { stat: 'trap_increased_damage_if_tracked', condition: config => config.target_is_tracked }
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'poison_damage',
            precision: 3,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'poison_damage_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'poison_increased_damage_per_poisoned_enemy', condition: config => config.poison_enemies > 0, multiplier: config => config.poison_enemies },
                    { stat: 'poison_increased_damage' }
                ],
                maxMultiplier: [],
            } 
        }
    ],
    2: [
        {
            stat: 'arcane_bond_damage',
            precision: 0,
            allowMinMax: true,
            source: {
                flat: [
                    { stat: 'arcane_bond_damage_add' },
                    { stat: 'arcane_bond_damage_add_from_restored_mana', condition: (_, stats) => hasStat(stats, 'percent_restored_mana_as_mana_bond'), multiplier: (_, stats) => getFirstStat(stats, 'percent_restored_mana_as_mana_bond') / 100 },
                ],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'arcane_bond_increased_damage_mult_if_close', condition: config => config.use_enemy_state && config.target_is_close },
                    { stat: 'arcane_bond_increased_damage_mult_if_in_breach_range', condition: config => config.target_is_in_breach_range },
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'max_arcane_clone',
            precision: 0,
            allowMinMax: true,
            source: {
                flat: [{ stat: 'max_arcane_clone_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                ],
                maxMultiplier: [],
            } 
        }
    ],
}

export const SKILL_MERGED_STATS_MAPPING: GameHeroesData<{ [key: number]: Array<MergedStatMapping>}> = {
    0: {
        5: [
            {
                stat: 'bleed_increased_damage',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [{ stat: 'bleed_increased_damage_mult' }],
                    maxMultiplier: [],
                } 
            }
        ],
        10: [
            {
                stat: 'training_lance_additional_damage',
                precision: 0,
                allowMinMax: true,
                source: {
                    flat: [
                        { stat: 'training_lance_additional_damage_add' },
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'elder_lance_additional_damage',
                precision: 3,
                allowMinMax: true,
                source: {
                    flat: [
                        { stat: 'elder_lance_additional_damage_per_cosmic_stack', condition: config => config.cosmic_stacks > 0, multiplier: config => config.cosmic_stacks },
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'elder_lance_ancestral_damage',
                precision: 3,
                allowMinMax: false,
                source: {
                    flat: [
                        { stat: 'brut_damage_percent' },
                        { stat: 'nimble_buff_brut_damage_percent',
                            condition: config => config.has_nimble_buff, 
                            multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getFirstStat(stats, 'nimble_champion_max_stacks'), 0))
                        },
                        { stat: 'elder_lance_ancestral_damage_per_cosmic_stack', condition: config => config.cosmic_stacks > 0, multiplier: config => config.cosmic_stacks },
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'training_lance_chance_to_pierce',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [ ...CHANCE_TO_PIERCE.source.flat,
                        { stat: 'training_lance_chance_to_pierce_percent_if_low_life', condition: (config, stats) => config.use_enemy_state && config.enemy_percent_missing_health > getFirstStat(stats, 'training_lance_chance_to_pierce_percent_if_low_life_treshold') },
                    ],
                    max: [...CHANCE_TO_PIERCE.source.max],
                    percent: [...CHANCE_TO_PIERCE.source.percent],
                    maxPercent: [...CHANCE_TO_PIERCE.source.maxPercent],
                    multiplier: [...CHANCE_TO_PIERCE.source.multiplier],
                    maxMultiplier: [...CHANCE_TO_PIERCE.source.maxMultiplier],
                }
            },
            {
                stat: 'elder_lance_increased_damage',
                precision: 2,
                allowMinMax: false,
                source: {
                    flat: [
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [                        
                        { stat: 'elder_lance_increased_damage_mult_if_high_life', condition: (config, stats) => config.use_enemy_state && config.enemy_percent_missing_health < getFirstStat(stats, 'elder_lance_increased_damage_mult_if_high_life_treshold') },
                    ],
                    maxMultiplier: [],
                } 
                
            }
        ]
    },
    1: {
        0: [
            {
                stat: 'turret_syndrome_fire_rate',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'fire_rate' }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_increased_damage',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'light_arrow_increased_damage' }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_projectile_speed',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'shared_projectile_speed', condition: config => config.hero_close_to_turret_syndrome }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_additional_projectile',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'shared_additional_projectile', condition: config => config.hero_close_to_turret_syndrome }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_fork',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'shared_fork', condition: config => config.hero_close_to_turret_syndrome }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_pierce',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [
                        { stat: 'shared_pierce', condition: config => config.hero_close_to_turret_syndrome },
                        { stat: 'light_arrow_chance_to_pierce_percent' }
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            },
            {
                stat: 'light_arrow_rebound',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [{ stat: 'shared_rebound', condition: config => config.hero_close_to_turret_syndrome }],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            }
        ],
        10: [
            {
                stat: 'additional_instructions',
                precision: 0,
                allowMinMax: false,
                source: {
                    flat: [
                        { stat: 'instructions_add' }
                    ],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
                } 
            }
        ]
    },
    2: {
        
    },
}