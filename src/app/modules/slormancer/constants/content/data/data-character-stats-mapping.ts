import { CharacterConfig } from '../../../model/character-config';
import { CharacterExtractedStatMap } from '../../../services/content/slormancer-stats-extractor.service';
import { valueOrDefault } from '../../../util/utils';

function getFirstStat(stats: CharacterExtractedStatMap, stat: string, defaultValue: number = 0): number {
    const found = stats[stat];

    return found ? valueOrDefault(found[0], defaultValue) : defaultValue;
}

export interface CharacterStatMappingSource {
    stat: string;
    condition?: (config: CharacterConfig, stats: CharacterExtractedStatMap) => boolean
    multiplier?: (config: CharacterConfig, stats: CharacterExtractedStatMap) => number
};

export interface CharacterStatMapping {
    stat: string;
    precision: number;
    allowMinMax: boolean;
    source: {
        flat: Array<CharacterStatMappingSource>;
        max: Array<CharacterStatMappingSource>;
        percent: Array<CharacterStatMappingSource>;
        multiplier: Array<CharacterStatMappingSource>;
    }
}

// en attendant que je sache comment l'utiliser
// const increased_damage_source: CharacterStatMappingSource = { stat: 'increased_damage_for_each_yard_with_target', condition: config => config.distance_with_target > 0, multiplier:  config => config.distance_with_target };

export const HERO_CHARACTER_STATS_MAPPING: Array<CharacterStatMapping> = [
    // adventure
    {
        stat: 'essence_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'slormite_find_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'xp_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'xp_find_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'influence_gain',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'influence_gain_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'mf_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mf_find_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'mf_qual',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mf_qual_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    // max_health
    {
        stat: 'max_health',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'the_max_health_add' }],
            max: [],
            percent: [{ stat: 'the_max_health_percent' }],
            multiplier: [{ stat: 'the_max_health_global_mult' }],
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
            multiplier: [],
        } 
    },
    {
        stat: 'health_leech_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'health_leech_percent' },
                { stat: 'health_leech_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'health_leech_percent_on_low_life_treshold', 0)) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'life_on_hit',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'health_on_hit_add' },
                { stat: 'health_on_hit_add_after_crit', condition: (config, stats) => config.seconds_since_last_crit <= getFirstStat(stats, 'health_on_hit_add_after_crit_duration', 0) }

            ],
            max: [],
            percent: [{ stat: 'health_on_hit_percent' }],
            multiplier: [{ stat: 'health_on_hit_global_mult' }],
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
            multiplier: [{ stat: 'health_on_kill_global_mult' }],
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
            percent: [{ stat: 'the_max_mana_percent' }],
            multiplier: [{ stat: 'the_max_mana_global_mult' }],
        } 
    },
    {
        stat: 'mana_regeneration',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mana_regen_add' }],
            max: [],
            percent: [{ stat: 'mana_regen_percent' }],
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'mana_on_hit',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mana_on_hit_add' }],
            max: [],
            percent: [{ stat: 'mana_on_hit_percent' }],
            multiplier: [{ stat: 'mana_on_hit_global_mult' }],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'mana_on_kill_add' }],
            max: [],
            percent: [{ stat: 'mana_on_kill_percent' }],
            multiplier: [{ stat: 'mana_on_kill_global_mult' }],
        } 
    },
    // movement
    {
        stat: 'the_speed_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'the_speed_add' }],
            max: [],
            percent: [
                { stat: 'the_speed_percent' },
                { stat: 'the_speed_percent_after_dodge', condition: (config, stats) => config.seconds_since_last_dodge <= getFirstStat(stats, 'the_speed_percent_after_dodge_duration', 0) }
            ],
            multiplier: [],
        } 
    },
    // Attack
    {
        stat: 'attack_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'cooldown_reduction_percent' }],
            max: [],
            percent: [],
            multiplier: [
                { stat: 'cooldown_reduction_global_mult' },
                { stat: 'cooldown_reduction_global_mult_after_crit', condition: (config, stats) => config.seconds_since_last_crit <= getFirstStat(stats, 'cooldown_reduction_global_mult_after_crit_duration', 0) }
            ],
        } 
    },
    {
        stat: 'enemy_attack_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'enemy_cooldown_reduction_percent' }],
            max: [],
            percent: [],
            multiplier: [
                { stat: 'enemy_cooldown_reduction_global_mult' },
                { stat: 'aura_air_conditionner_enemy_cooldown_reduction_global_mult', condition: config => config.has_aura_air_conditionner },
            ],
        } 
    },
    {
        stat: 'critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'crit_chance_percent' },
                { stat: 'crit_chance_percent_if_no_enemies_around', condition: (config, stats) => valueOrDefault(config.ennemies_in_radius[getFirstStat(stats, 'crit_chance_percent_if_no_enemies_around_radius')], 0) === 0 },
                { stat: 'greed_stack_crit_chance_percent', condition: config => config.greed_stacks > 0, multiplier: config => config.greed_stacks },
                { stat: 'strider_stack_crit_chance_percent', condition: config => config.strider_stacks > 0, multiplier: config => config.strider_stacks }
            ],
            max: [],
            percent: [],
            multiplier: [
                { stat: 'crit_chance_global_mult_after_hit_taken', condition: config => config.took_damage_before_next_cast }
            ],
        } 
    },
    {
        stat: 'critical_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'crit_damage_percent' },
                { stat: 'crit_damage_percent_for_each_ennemy', multiplier: (config, stats) => valueOrDefault(config.ennemies_in_radius[getFirstStat(stats, 'crit_damage_percent_for_each_ennemy_radius')], 0) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'ancestral_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'brut_chance_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'ancestral_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'brut_damage_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'armor_penetration',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'armor_penetration_percent' }],
            max: [],
            percent: [],
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'increased_on_elite',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'increased_damage_on_elite_percent' },
                { stat: 'increased_damage_on_elite_percent_for_each_elite', multiplier: (config, stats) => valueOrDefault(config.elites_in_radius[getFirstStat(stats, 'increased_damage_on_elite_percent_for_each_elite_radius')], 0) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'armor',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'res_phy_add' }],
            max: [],
            percent: [{ stat: 'res_phy_percent' }],
            multiplier: [
                { stat: 'res_phy_global_mult' },
                { stat: 'res_phy_global_mult_on_low_life',condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'res_phy_global_mult_on_low_life_treshold', 0)) }
            ],
        } 
    },
    {
        stat: 'elemental_resist',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'res_mag_add' },
                { stat: 'aura_neriya_shield_res_mag_add', condition: config => config.has_aura_neriya_shield }
            ],
            max: [],
            percent: [{ stat: 'res_mag_percent' }],
            multiplier: [
                { stat: 'res_mag_global_mult' },
                { stat: 'res_mag_global_mult_after_elemental_damage_taken', condition: config => config.took_elemental_damage_recently }
            ],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'dodge',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'dodge_add' }],
            max: [],
            percent: [{ stat: 'dodge_percent' }],
            multiplier: [{ stat: 'dodge_global_mult' }],
        } 
    },
    {
        stat: 'thorns',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'thorns_add' }],
            max: [],
            percent: [{ stat: 'thorns_percent' }],
            multiplier: [{ stat: 'thorns_global_mult' }],
        } 
    },
    {
        stat: 'retaliate',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'retaliate_percent' },
                { stat: 'retaliate_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'retaliate_percent_on_low_life_treshold', 0)) }
            
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'tenacity',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'tenacity_percent' }],
            max: [],
            percent: [],
            multiplier: [],
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
                }
            ],
            max: [],
            percent: [],
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'reduced_on_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'reduced_damage_from_melee_percent' },
                { stat: 'reduced_damage_from_melee_percent_for_each_ennemy', multiplier: (config, stats) => valueOrDefault(config.ennemies_in_radius[getFirstStat(stats, 'reduced_damage_from_melee_percent_for_each_ennemy_radius')], 0) }
        
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'reduced_on_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'reduced_damage_from_projectile_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'reduced_on_area',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'reduced_damage_from_area_percent' }],
            max: [],
            percent: [],
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'inner_fire_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'inner_fire_chance_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'inner_fire_max_number',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'inner_fire_max_number_add' }],
            max: [],
            percent: [{ stat: 'inner_fire_max_number_percent' }],
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'inner_fire_damage_base_percent',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'inner_fire_damage_add' }],
            max: [],
            percent: [{ stat: 'inner_fire_damage_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'overdrive_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'overdrive_chance_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'overdrive_bounce_number',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'overdrive_bounce_number_add' }],
            max: [],
            percent: [{ stat: 'overdrive_bounce_number_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'overdrive_damage_base_percent',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'overdrive_damage_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'recast_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'recast_chance_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'knockback_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'knockback_melee_add' }],
            max: [],
            percent: [{ stat: 'knockback_melee_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'knockback_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'knockback_melee_add' }],
            max: [],
            percent: [{ stat: 'knockback_melee_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'additional_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'additional_projectile_add' }],
            max: [],
            percent: [{ stat: 'additional_projectile_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'chance_to_pierce',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'chance_to_pierce_percent' },
                { stat: 'chance_to_pierce_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'fork_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'fork_chance_percent' },
                { stat: 'fork_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'chance_to_rebound',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'rebound_chance_percent' },
                { stat: 'rebound_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'projectile_speed',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'increased_proj_speed_percent' },
                { stat: 'increased_proj_speed_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'knockback_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'knockback_projectile_add' }],
            max: [],
            percent: [{ stat: 'knockback_projectile_percent' }],
            multiplier: [],
        } 
    },
    {
        stat: 'aoe_increased_size',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'aoe_increased_size_percent' }],
            max: [],
            percent: [],
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
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
            multiplier: [],
        } 
    },
    {
        stat: 'elemental_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [{ stat: 'min_elemental_damage_add' }],
            max: [{ stat: 'max_elemental_damage_add' }],
            percent: [
                { stat: 'elemental_damage_percent' },
                { stat: 'elemental_prowess_elemental_damage_percent', condition: config => config.elemental_prowess_stacks > 0, multiplier: config => config.elemental_prowess_stacks },
                { stat: 'legendary_elemental_damage_percent', condition: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) > 0, multiplier: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) }
            ],
            multiplier: [{ stat: 'elemental_damage_mult' }, { stat: 'elemental_damage_global_mult' }],
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
            percent: [{ stat: 'basic_damage_percent' }],
            multiplier: [{ stat: 'basic_damage_percent_mult' }, { stat: 'basic_damage_percent_global_mult' }],
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
            multiplier: [
                { stat: 'weapon_damage_mult' },
                { stat: 'weapon_damage_mult_after_support_cast', condition: config => config.cast_support_before_next_cast }
            ],
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
            multiplier: [],
        } 
    },
    {
        stat: 'mana_cost_reduction',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [
                { stat: 'all_skill_mana_cost_reduction_per_cast', condition: config => config.skill_cast_recently > 0, multiplier: config => config.skill_cast_recently }
            ],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
]