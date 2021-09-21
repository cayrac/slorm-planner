// TODO autre liste de conditions pour chaque stat
export interface CharacterStatMapping {
    stat: string;
    precision: number;
    allowMinMax: boolean;
    source: {
        flat: Array<string>;
        max: Array<string>;
        percent: Array<string>;
        multiplier: Array<string>;
    }
}

export const HERO_CHARACTER_STATS_MAPPING: Array<CharacterStatMapping> = [
    // adventure
    {
        stat: 'essence_find',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['slormite_find_percent'],
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
            flat: ['xp_find_percent'],
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
            flat: ['influence_gain_percent'],
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
            flat: ['mf_find_percent'],
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
            flat: ['mf_qual_percent'],
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
            flat: ['the_max_health_add'],
            max: [],
            percent: ['the_max_health_percent'],
            multiplier: ['the_max_health_global_mult'],
        } 
    },
    {
        stat: 'health_regeneration',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['health_regen_add'],
            max: [],
            percent: ['health_regen_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'health_leech_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: ['health_leech_percent'],
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
            flat: ['health_on_hit_add'],
            max: [],
            percent: ['health_on_hit_percent'],
            multiplier: ['health_on_hit_global_mult'],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['health_on_kill_add'],
            max: [],
            percent: ['health_on_kill_percent'],
            multiplier: ['health_on_kill_global_mult'],
        } 
    },
    // max_mana
    {
        stat: 'max_mana',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['the_max_mana_add'],
            max: [],
            percent: ['the_max_mana_percent'],
            multiplier: ['the_max_mana_global_mult'],
        } 
    },
    {
        stat: 'mana_regeneration',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['mana_regen_add'],
            max: [],
            percent: ['mana_regen_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'mana_leech_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: ['mana_leech_percent'],
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
            flat: ['mana_on_hit_add'],
            max: [],
            percent: ['mana_on_hit_percent'],
            multiplier: ['mana_on_hit_global_mult'],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['mana_on_kill_add'],
            max: [],
            percent: ['mana_on_kill_percent'],
            multiplier: ['mana_on_kill_global_mult'],
        } 
    },
    // movement
    {
        stat: 'the_speed_percent',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: ['the_speed_add'],
            max: [],
            percent: ['the_speed_percent'],
            multiplier: [],
        } 
    },
    // Attack
    {
        stat: 'attack_speed',
        precision: 3,
        allowMinMax: false,
        source: {
            flat: ['cooldown_reduction_percent'],
            max: [],
            percent: [],
            multiplier: ['cooldown_reduction_global_mult'],
        } 
    },
    {
        stat: 'critical_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['crit_chance_percent'],
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
            flat: ['crit_damage_percent'],
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
            flat: ['brut_chance_percent'],
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
            flat: ['brut_damage_percent'],
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
            flat: ['armor_penetration_percent'],
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
            flat: ['elemental_penetration_percent'],
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
            flat: ['dot_increased_damage_percent'],
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
            flat: ['increased_damage_on_elite_percent'],
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
            flat: ['res_phy_add'],
            max: [],
            percent: ['res_phy_percent'],
            multiplier: ['res_phy_global_mult'],
        } 
    },
    {
        stat: 'elemental_resist',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['res_mag_add'],
            max: [],
            percent: ['res_mag_percent'],
            multiplier: ['res_mag_global_mult'],
        } 
    },
    {
        stat: 'fire_resistance',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['fire_resistance_percent'],
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
            flat: ['ice_resistance_percent'],
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
            flat: ['lightning_resistance_percent'],
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
            flat: ['light_resistance_percent'],
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
            flat: ['shadow_resistance_percent'],
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
            flat: ['dodge_add'],
            max: [],
            percent: ['dodge_percent'],
            multiplier: ['dodge_global_mult'],
        } 
    },
    {
        stat: 'thorns',
        precision: 0,
        allowMinMax: false,
        source: {
            flat: ['thorns_add'],
            max: [],
            percent: ['thorns_percent'],
            multiplier: ['thorns_global_mult'],
        } 
    },
    {
        stat: 'retaliate',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['retaliate_percent'],
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
            flat: ['tenacity_percent'],
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
            flat: ['reduced_damage_from_all_percent'],
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
            flat: ['reduced_damage_on_elite_percent'],
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
            flat: ['reduced_damage_from_melee_percent'],
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
            flat: ['reduced_damage_from_projectile_percent'],
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
            flat: ['reduced_damage_from_area_percent'],
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
            flat: ['gold_find_percent'],
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
            flat: ['scrap_find_percent'],
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
            flat: ['slormite_find_percent'],
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
            flat: ['slormeline_find_percent'],
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
            flat: ['reaper_find_percent'],
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
            flat: ['reaper_xp_find_percent'],
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
            flat: ['skill_mastery_gain_percent'],
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
            flat: ['inner_fire_chance_percent'],
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
            flat: ['inner_fire_max_number_add'],
            max: [],
            percent: ['inner_fire_max_number_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'inner_fire_duration',
        precision: 2,
        allowMinMax: false,
        source: {
            flat: ['inner_fire_duration_add'],
            max: [],
            percent: ['inner_fire_duration_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'inner_fire_damage_base_percent',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['inner_fire_damage_add'],
            max: [],
            percent: ['inner_fire_damage_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'overdrive_chance',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['overdrive_chance_percent'],
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
            flat: ['overdrive_bounce_number_add'],
            max: [],
            percent: ['overdrive_bounce_number_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'overdrive_damage_base_percent',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['overdrive_damage_percent'],
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
            flat: ['recast_chance_percent'],
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
            flat: ['knockback_melee_add'],
            max: [],
            percent: ['knockback_melee_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'knockback_melee',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['knockback_melee_add'],
            max: [],
            percent: ['knockback_melee_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'additional_projectile',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['additional_projectile_add'],
            max: [],
            percent: ['additional_projectile_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'chance_to_pierce',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['chance_to_pierce_percent'],
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
            flat: ['fork_chance_percent'],
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
            flat: ['rebound_chance_percent'],
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
            flat: ['increased_proj_speed_percent'],
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
            flat: ['knockback_projectile_add'],
            max: [],
            percent: ['knockback_projectile_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'aoe_increased_size',
        precision: 1,
        allowMinMax: false,
        source: {
            flat: ['aoe_increased_size_percent'],
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
            flat: ['aoe_increased_effect_percent'],
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
            flat: ['totem_increased_effect_percent'],
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
            flat: ['aura_increased_effect_percent'],
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
            flat: ['minion_increased_damage_percent'],
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
            flat: ['min_elemental_damage_add'],
            max: ['max_elemental_damage_add'],
            percent: [],
            multiplier: ['elemental_damage_mult', 'elemental_damage_global_mult'],
        } 
    },
    {
        stat: 'basic_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: ['min_basic_damage_add'],
            max: ['max_basic_damage_add'],
            percent: ['basic_damage_percent'],
            multiplier: ['basic_damage_percent_mult', 'basic_damage_percent_global_mult'],
        } 
    },
    {
        stat: 'weapon_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: ['min_weapon_damage_add'],
            max: ['max_weapon_damage_add'],
            percent: [],
            multiplier: ['weapon_damage_mult'],
        } 
    },
    {
        stat: 'physical_damage',
        precision: 0,
        allowMinMax: true,
        source: {
            flat: ['basic_to_physical_damage', 'weapon_to_physical_damage'],
            max: [],
            percent: [],
            multiplier: [],
        } 
    },
]