// TODO autre liste de conditions pour chaque stat
export interface CharacterStatMapping {
    stat: string;
    precision: number;
    source: {
        flat: Array<string>;
        percent: Array<string>;
        multiplier: Array<string>;
    }
}

export const HERO_CHARACTER_STATS_MAPPING: Array<CharacterStatMapping> = [
    // adventure
    {
        stat: 'essence_find',
        precision: 1,
        source: {
            flat: ['slormite_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'xp_find',
        precision: 1,
        source: {
            flat: ['xp_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'influence_gain',
        precision: 1,
        source: {
            flat: ['influence_gain_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'mf_find',
        precision: 1,
        source: {
            flat: ['mf_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'mf_qual',
        precision: 1,
        source: {
            flat: ['mf_qual_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    // max_health
    {
        stat: 'max_health',
        precision: 0,
        source: {
            flat: ['the_max_health_add'],
            percent: ['the_max_health_percent'],
            multiplier: ['the_max_health_global_mult'],
        } 
    },
    {
        stat: 'health_regeneration',
        precision: 0,
        source: {
            flat: ['health_regen_add'],
            percent: ['health_regen_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'health_leech_percent',
        precision: 3,
        source: {
            flat: ['health_leech_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'life_on_hit',
        precision: 0,
        source: {
            flat: ['health_on_hit_add'],
            percent: ['health_on_hit_percent'],
            multiplier: ['health_on_hit_global_mult'],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        source: {
            flat: ['health_on_kill_add'],
            percent: ['health_on_kill_percent'],
            multiplier: ['health_on_kill_global_mult'],
        } 
    },
    // max_mana
    {
        stat: 'max_mana',
        precision: 0,
        source: {
            flat: ['the_max_mana_add'],
            percent: ['the_max_mana_percent'],
            multiplier: ['the_max_mana_global_mult'],
        } 
    },
    {
        stat: 'mana_regeneration',
        precision: 0,
        source: {
            flat: ['mana_regen_add'],
            percent: ['mana_regen_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'mana_leech_percent',
        precision: 3,
        source: {
            flat: ['mana_leech_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'mana_on_hit',
        precision: 0,
        source: {
            flat: ['mana_on_hit_add'],
            percent: ['mana_on_hit_percent'],
            multiplier: ['mana_on_hit_global_mult'],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        source: {
            flat: ['mana_on_kill_add'],
            percent: ['mana_on_kill_percent'],
            multiplier: ['mana_on_kill_global_mult'],
        } 
    },
    // movement
    {
        stat: 'the_speed_percent',
        precision: 3,
        source: {
            flat: ['the_speed_add'],
            percent: ['the_speed_percent'],
            multiplier: [],
        } 
    },
    // Attack
    {
        stat: 'attack_speed',
        precision: 3,
        source: {
            flat: ['cooldown_reduction_percent'],
            percent: [],
            multiplier: ['cooldown_reduction_global_mult'],
        } 
    },
    {
        stat: 'min_basic_damage_add',
        precision: 0,
        source: {
            flat: ['min_basic_damage_add'],
            percent: ['basic_damage_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'max_basic_damage_add',
        precision: 0,
        source: {
            flat: ['max_basic_damage_add'],
            percent: ['basic_damage_percent'],
            multiplier: [],
        } 
    },
    {
        stat: 'min_weapon_damage_add',
        precision: 0,
        source: {
            flat: ['min_weapon_damage_add'],
            percent: [],
            multiplier: ['weapon_damage_mult'],
        } 
    },
    {
        stat: 'max_weapon_damage_add',
        precision: 0,
        source: {
            flat: ['max_weapon_damage_add'],
            percent: [],
            multiplier: ['weapon_damage_mult'],
        } 
    },
    {
        stat: 'min_elemental_damage_add',
        precision: 0,
        source: {
            flat: ['min_elemental_damage_add'],
            percent: [],
            multiplier: ['elemental_damage_mult', 'elemental_damage_global_mult'],
        } 
    },
    {
        stat: 'max_elemental_damage_add',
        precision: 0,
        source: {
            flat: ['max_elemental_damage_add'],
            percent: [],
            multiplier: ['elemental_damage_mult', 'elemental_damage_global_mult'],
        } 
    },
    {
        stat: 'critical_chance',
        precision: 1,
        source: {
            flat: ['crit_chance_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'critical_damage',
        precision: 1,
        source: {
            flat: ['crit_damage_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'ancestral_chance',
        precision: 1,
        source: {
            flat: ['brut_chance_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        stat: 'ancestral_damage',
        precision: 1,
        source: {
            flat: ['brut_damage_percent'],
            percent: [],
            multiplier: [],
        } 
    }
]