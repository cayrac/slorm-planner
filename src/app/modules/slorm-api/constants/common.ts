import { ALL_UPGRADABLE_REAPER_SMITH } from "../model";

export const MAX_HERO_LEVEL = 80;
export const MAX_ITEM_LEVEL = MAX_HERO_LEVEL;
export const MAX_ATTRIBUTE_RANK = 75;
export const MAX_REAPER_LEVEL = 100;

export const MAX_DEFENSIVE_STATS = 1;
export const MAX_MAGIC_STATS = 1;
export const MAX_RARE_STATS = 1;
export const MAX_EPIC_STATS = 3;

export const MAX_REINFORCMENT_UPGRADE = 15;

export const INVENTORY_SIZE = 64;
export const STASH_SIZE = 35;
export const STASH_TABS_COUNT = 12;

export const SKILL_MAX_MASTERY = 15;
export const ULTIMATUM_MAX_LEVEL = 15;

export const UNLOCKED_ANCESTRAL_LEGACY_POINTS = 7;

export const MAXIMUM_ANCESTRAL_LEGACY_POINTS = 7;

export const DELIGHTED_VALUE = 12;
export const ATTACK_SPEED_PER_DELIGHTED_STACK = 2;
export const COOLDOWN_REDUCTION_PER_DELIGHTED_STACK = 1;

export const BASE_MOVEMENT_SPEED = 2.4;
export const POISON_DAMAGE_PERCENT = 200;
export const RAVENOUS_DAGGER_DAMAGE_PERCENT = 100;
export const TRAP_DAMAGE_PERCENT = 200;
export const TRAP_AOE = 1.5;
export const TRAP_STUN_DURATION = 3;
export const TRAP_ARM_DURATION = 1;
export const ASTRAL_RETRIBUTION_DAMAGE_PERCENT = 300;
export const ASTRAL_METEOR_DAMAGE_PERCENT = 300;
export const ASTRAL_METEOR_AOE = 1.5;
export const ARCANE_CLONE_ATTACK_SPEED_REDUCTION = -35;
export const ARCANE_BOND_DAMAGE_FROM_MANA_SPENT = 100;
export const ARCANE_BOND_DAMAGE_FROM_MAX_MANA = 15;
export const MAX_EMBLEMS = 3;
export const REMNANT_DAMAGE_REDUCTION = 50;
export const MAX_REAPER_AFFINITY_BONUS = 50;
export const MAX_REAPER_AFFINITY_BASE = 100;
export const MAX_EFFECT_AFFINITY_BASE = MAX_REAPER_AFFINITY_BASE * ALL_UPGRADABLE_REAPER_SMITH.length;
export const FAST_SKILL_BASE_COOLDOWN = 0.33;
export const ATTACK_SPEED_PER_ARCANIC_EMBLEM = 5;
export const COOLDOWN_REDUCTION_PER_TEMPORAL_EMBLEM = 3;
export const DAMAGE_PER_OBLITERATION_EMBLEM = 5;

export const SHIELD_DURATION = 3;
export const POISON_DURATION = 7;
export const ARCANE_BOND_DURATION = 7;
export const TIME_LOCK_DURATION = 3;

export const GAME_VERSION = '0.9.3b';
export const API_VERSION = '0.7.0';

export const API_TO_GAME_VERSION_MAPPER: { [key: string]: string } = {
    '0.0.9': '0.3.015',
    '0.0.10': '0.3.015',
    '0.0.11': '0.3.015',
    '0.0.12': '0.3.015',
    '0.1.0': '0.3.1071',
    '0.1.1': '0.3.1071',
    '0.1.2': '0.4.191',
    '0.1.3': '0.4.191',
    '0.1.4': '0.4.191',
    '0.1.5': '0.4.21',
    '0.2.0': '0.4.6a',
    '0.2.1': '0.4.6a',
    '0.2.2': '0.4.6a',
    '0.2.3': '0.4.6fa',
    '0.2.5': '0.4.91b',
    '0.3.0': '0.5.01e',
    '0.3.1': '0.5.01e',
    '0.4.0': '0.6.5l',
    '0.4.1': '0.6.5n',
    '0.5.0': '0.7.0g',
    '0.5.1': '0.7.0g',
    '0.6.0': '0.8.0i',
    '0.6.1': '0.8.0i',
    '0.6.2': '0.8.0i',
    '0.6.4': '0.8.0i',
    '0.7.0': '0.9.3b',
}

export const PERCENT_STATS: string[] = [
    'essence_find',
    'xp_find',
    'influence_gain',
    'mf_find',
    'mf_qual',
    'health_leech_percent',
    'mana_leech_percent',
    'critical_chance',
    'critical_damage',
    'ancestral_chance',
    'ancestral_damage',
    'armor_penetration',
    'elemental_penetration',
    'dot_increased_damage',
    'increased_on_elite',
    'fire_resistance',
    'ice_resistance',
    'lightning_resistance',
    'light_resistance',
    'shadow_resistance',
    'retaliate',
    'tenacity',
    'reduced_on_all',
    'reduced_by_elite',
    'reduced_on_melee',
    'reduced_on_projectile',
    'reduced_on_area',
    'gold_find',
    'scrap_find',
    'slormite_find',
    'slormeline_find',
    'reaper_find',
    'skill_mastery_gain',
    'inner_fire_chance',
    'overdrive_chance',
    'recast_chance',
    'knockback_melee',
    'chance_to_pierce',
    'fork_chance',
    'chance_to_rebound',
    'projectile_speed',
    'knockback_projectile',
    'aoe_increased_size',
    'aoe_increased_effect',
    'totem_increased_effect',
    'aura_increased_effect',
    'minion_increased_damage',
];

export const UNITY_REAPERS = [47, 48, 49, 50, 51, 52];