import { CharacterStatType } from '../../../model/content/character-stats';

// TODO autre liste de conditions pour chaque stat
export interface CharacterStatMapping {
    section: string;
    stat: string;
    type: CharacterStatType;
    precision: number;
    sign: boolean;
    source: {
        flat: Array<string>;
        percent: Array<string>;
        multiplier: Array<string>;
    }
}

export const HERO_CHARACTER_STATS_MAPPING: Array<CharacterStatMapping> = [
    // adventure
    {
        section: 'cat_adventure',
        stat: 'essence_find',
        type: CharacterStatType.Percent,
        precision: 1,
        sign: true,
        source: {
            flat: ['slormite_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_adventure',
        stat: 'xp_find',
        type: CharacterStatType.Percent,
        precision: 1,
        sign: true,
        source: {
            flat: ['xp_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_adventure',
        stat: 'influence_gain',
        type: CharacterStatType.Percent,
        precision: 1,
        sign: true,
        source: {
            flat: ['influence_gain_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_adventure',
        stat: 'mf_find',
        type: CharacterStatType.Percent,
        precision: 1,
        sign: true,
        source: {
            flat: ['mf_find_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_adventure',
        stat: 'mf_qual',
        type: CharacterStatType.Percent,
        precision: 1,
        sign: true,
        source: {
            flat: ['mf_qual_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    // max_health
    {
        section: 'cat_health',
        stat: 'max_health',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['the_max_health_add'],
            percent: ['the_max_health_percent'],
            multiplier: ['the_max_health_global_mult'],
        } 
    },
    {
        section: 'cat_health',
        stat: 'health_regeneration',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['health_regen_add'],
            percent: ['health_regen_percent'],
            multiplier: [],
        } 
    },
    {
        section: 'cat_health',
        stat: 'health_leech_percent',
        type: CharacterStatType.Percent,
        precision: 3,
        sign: false,
        source: {
            flat: ['health_leech_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_health',
        stat: 'life_on_hit',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['health_on_hit_add'],
            percent: ['health_on_hit_percent'],
            multiplier: ['health_on_hit_global_mult'],
        } 
    },
    {
        section: 'cat_health',
        stat: 'life_on_kill',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['health_on_kill_add'],
            percent: ['health_on_kill_percent'],
            multiplier: ['health_on_kill_global_mult'],
        } 
    },
    // max_mana
    {
        section: 'cat_mana',
        stat: 'max_mana',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['the_max_mana_add'],
            percent: ['the_max_mana_percent'],
            multiplier: ['the_max_mana_global_mult'],
        } 
    },
    {
        section: 'cat_mana',
        stat: 'mana_regeneration',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['mana_regen_add'],
            percent: ['mana_regen_percent'],
            multiplier: [],
        } 
    },
    {
        section: 'cat_mana',
        stat: 'mana_leech_percent',
        type: CharacterStatType.Percent,
        precision: 3,
        sign: false,
        source: {
            flat: ['mana_leech_percent'],
            percent: [],
            multiplier: [],
        } 
    },
    {
        section: 'cat_mana',
        stat: 'mana_on_hit',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['mana_on_hit_add'],
            percent: ['mana_on_hit_percent'],
            multiplier: ['mana_on_hit_global_mult'],
        } 
    },
    {
        section: 'cat_mana',
        stat: 'life_on_kill',
        type: CharacterStatType.None,
        precision: 0,
        sign: true,
        source: {
            flat: ['mana_on_kill_add'],
            percent: ['mana_on_kill_percent'],
            multiplier: ['mana_on_kill_global_mult'],
        } 
    },
    // movement
    {
        section: 'cat_movement',
        stat: 'the_speed_percent',
        type: CharacterStatType.None,
        precision: 3,
        sign: false,
        source: {
            flat: ['the_speed_add'],
            percent: ['the_speed_percent'],
            multiplier: [],
        } 
    },
    // Attack
    {
        section: 'cat_attack',
        stat: 'attack_speed',
        type: CharacterStatType.Percent,
        precision: 3,
        sign: false,
        source: {
            flat: ['cooldown_reduction_percent'],
            percent: [],
            multiplier: ['cooldown_reduction_global_mult'],
        } 
    },
    {
        section: 'cat_attack',
        stat: 'min_basic_damage_add',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['min_basic_damage_add'],
            percent: ['basic_damage_percent'],
            multiplier: [],
        } 
    },
    {
        section: 'cat_attack',
        stat: 'max_basic_damage_add',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['max_basic_damage_add'],
            percent: ['basic_damage_percent'],
            multiplier: [],
        } 
    },
    {
        section: 'cat_attack',
        stat: 'min_weapon_damage_add',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['min_weapon_damage_add'],
            percent: [],
            multiplier: ['weapon_damage_mult'],
        } 
    },
    {
        section: 'cat_attack',
        stat: 'max_weapon_damage_add',
        type: CharacterStatType.None,
        precision: 0,
        sign: false,
        source: {
            flat: ['max_weapon_damage_add'],
            percent: [],
            multiplier: ['weapon_damage_mult'],
        } 
    }
]