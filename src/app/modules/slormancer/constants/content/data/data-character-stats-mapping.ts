// TODO autre liste de conditions pour chaque stat
import { CharacterConfig } from '../../../model/character-config';


export interface CharacterStatMappingSource {
    stat: string;
    condition?: (config: CharacterConfig) =>  boolean
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
            flat: [{ stat: 'health_leech_percent' }],
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
            flat: [{ stat: 'health_on_hit_add' }],
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
            percent: [{ stat: 'the_speed_percent' }],
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
            multiplier: [{ stat: 'cooldown_reduction_global_mult' }],
        } 
    },
    {
        stat: 'critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'crit_chance_percent' }],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'critical_damage',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'crit_damage_percent' }],
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
            flat: [{ stat: 'increased_damage_on_elite_percent' }],
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
                { stat: 'res_phy_global_mult_on_low_life', condition: config => config.percent_missing_health > 80 }
            ],
        } 
    },
    {
        stat: 'elemental_resist',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: [{ stat: 'res_mag_add' }],
            max: [],
            percent: [{ stat: 'res_mag_percent' }],
            multiplier: [{ stat: 'res_mag_global_mult' }],
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
            flat: [{ stat: 'retaliate_percent' }],
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
            flat: [{ stat: 'reduced_damage_from_all_percent' }],
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
            flat: [{ stat: 'reduced_damage_from_melee_percent' }],
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
            flat: [{ stat: 'chance_to_pierce_percent' }],
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
            flat: [{ stat: 'fork_chance_percent' }],
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
            flat: [{ stat: 'rebound_chance_percent' }],
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
            flat: [{ stat: 'increased_proj_speed_percent' }],
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
            flat: [{ stat: 'aoe_increased_effect_percent' }],
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
            flat: [{ stat: 'totem_increased_effect_percent' }],
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
            flat: [{ stat: 'minion_increased_damage_percent' }],
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
            percent: [{ stat: 'elemental_damage_percent' }],
            multiplier: [{ stat: 'elemental_damage_mult' }, { stat: 'elemental_damage_global_mult' }],
        } 
    },
    {
        stat: 'basic_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: [{ stat: 'min_basic_damage_add' }],
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
            multiplier: [{ stat: 'weapon_damage_mult' }],
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
]