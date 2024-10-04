import { HeroClass } from '../../../model';
import { CharacterConfig } from '../../../model/character-config';
import { ALL_SKILL_COST_TYPES, SkillCostType } from '../../../model/content/enum/skill-cost-type';
import { SkillElement } from '../../../model/content/skill-element';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { ExtractedStatMap } from '../../../services/content/slormancer-stats-extractor.service';
import { minAndMax, valueOrDefault } from '../../../util/utils';
import { DELIGHTED_VALUE } from '../../common';

function getFirstStat(stats: ExtractedStatMap, stat: string, defaultValue: number = 0): number {
    const found = stats[stat];
    return found ? valueOrDefault(found[0]?.value, defaultValue) : defaultValue;
}

function getSumStats(stats: ExtractedStatMap, stat: string, defaultValue: number = 0): number {
    const found = stats[stat];
    let result = defaultValue;

    if (found) {
        result = found.reduce((previous, current) => previous + current.value, 0);
    }

    return result;
}


function getMaxStacks(stats: ExtractedStatMap, stat: string, defaultValue: number = 0): number {
    return getFirstStat(stats, stat, defaultValue) + Math.ceil(getFirstStat(stats, 'increased_max_stacks', 0));
}

function getMinionsUnderYourControl(stats: ExtractedStatMap, config: CharacterConfig): number {
    return config.controlled_minions + getSumStats(stats, 'summoned_skeleton_squires', 0);
}

function getMaxStat(stats: ExtractedStatMap, stat: string): number {
    return Math.max(0, ...valueOrDefault(stats[stat]?.map(v => v.value), []));
}

function hasStat(stats: ExtractedStatMap, stat: string): boolean {
    return stats[stat] !== undefined;
}

function statHasValue(stats: ExtractedStatMap, stat: string, value: number): boolean {
    const extractedStat = stats[stat];
    return extractedStat !== undefined && extractedStat.some(entityValue => entityValue.value === value);
}

function hasCostType(stats: ExtractedStatMap, ...costTypes: Array<SkillCostType>): boolean {
    const costType = stats['cost_type'];

    const expectedCostTypes = costType ? valueOrDefault(costType.map(v => v.value), [ -1 ]) : [ -1 ];
    return costTypes.some(costType => expectedCostTypes.includes(ALL_SKILL_COST_TYPES.indexOf(costType)))
}

export interface MergedStatMappingSource {
    stat: string;
    extra?: boolean;
    addAsNonConvertion?: boolean;
    condition?: (config: CharacterConfig, stats: ExtractedStatMap) => boolean
    multiplier?: (config: CharacterConfig, stats: ExtractedStatMap) => number
    duplicate?: (config: CharacterConfig, stats: ExtractedStatMap) => number
};

export interface MergedStatMapping {
    stat: string;
    precision: number;
    allowMinMax: boolean;
    displayPrecision?: number;
    suffix: '%' | 's' | '';
    maximum?: number;
    source: {
        flat: Array<MergedStatMappingSource>;
        max: Array<MergedStatMappingSource>;
        percent: Array<MergedStatMappingSource>;
        maxPercent: Array<MergedStatMappingSource>;
        multiplier: Array<MergedStatMappingSource>;
        maxMultiplier: Array<MergedStatMappingSource>;
    }
}

const CHANCE_TO_PIERCE: MergedStatMapping = {
    stat: 'chance_to_pierce',
    precision: 1,
    allowMinMax: false,
    suffix: '%',
    source: {
        flat: [
            { stat: 'chance_to_pierce_percent' },
            { stat: 'chance_to_pierce_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
            { stat: 'chance_to_pierce_percent_if_fully_charged', condition: (config) => config.void_arrow_fully_charged },
            { stat: 'chance_to_pierce_percent_if_fortunate_of_perfect', condition: (config) => config.next_cast_is_fortunate || config.next_cast_is_perfect },
            { stat: 'chance_to_pierce_percent_if_projectile_passed_through_wall_of_omen', condition: (config, stats) => config.projectile_passed_through_wall_of_omen && hasStat(stats, 'skill_is_projectile') },
            { stat: 'academician_chance_to_pierce_extra', extra: true }
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [{ stat: 'chance_to_pierce_global_mult' }, { stat: 'academician_chance_to_pierce_mult' }],
        maxMultiplier: [],
    } 
}

const SKILL_MASTERY_LEVEL_MAPPING: MergedStatMapping[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => ({
    stat: 'based_on_mastery_' + id,
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'based_on_mastery_' + id + '_add' },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [],
        maxMultiplier: [],
    } 
}));

export const SKILL_MANA_COST_MAPPING: MergedStatMapping = {
    stat: 'skill_mana_cost',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'mana_cost_add_skill' },
            { stat: 'mana_cost_add_skill_imbue', condition: (_, stats) => !hasStat(stats, 'skill_is_support') , extra: true },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'arrow_shot_void_arrow_heavy_explosive_increased_mana_cost', condition: (_, stats) => [3, 6, 8].includes(getFirstStat(stats, 'skill_id', 0)) },
            { stat: 'mana_cost_reduction_skill_mult', multiplier: () => -1 }, // void arrow discount void 
            { stat: 'efficiency_skill_reduction_skill_mult', condition: config => config.efficiency_buff , multiplier: () => -1 },
            { stat: 'skill_has_no_cost_if_low_mana', condition: (_, stats) => (100 - getFirstStat(stats, 'percent_missing_mana', 0)) < getFirstStat(stats, 'skill_has_no_cost_if_low_mana_treshold', 0) },
            // skill_has_no_cost_if_low_mana_treshold
        ],
        maxMultiplier: [],
    } 
};

export const SKILL_LIFE_COST_MAPPING: MergedStatMapping = {
    stat: 'skill_life_cost',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'life_cost_add_skill_imbue', condition: (_, stats) => !hasStat(stats, 'skill_is_support') && hasStat(stats, 'skill_id'), extra: true },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [],
        maxMultiplier: [],
    } 
};

export const MANA_COST_MAPPING: MergedStatMapping = {
    stat: 'mana_cost',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'mana_cost_add' },
            { stat: 'cost_reduction_skill_per_bleed', condition: config => config.enemy_bleed_stacks > 0, multiplier: config => - config.enemy_bleed_stacks },
            { stat: 'spectral_shape_mana_cost_percent', extra: true, condition: (_, stats) => getFirstStat(stats, 'activable_id') === 32 },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'all_skill_cost_reduction_per_cast',
                condition: (config, stats) => config.skill_cast_recently > 0 && hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond, SkillCostType.Life, SkillCostType.LifeSecond),
                multiplier: config => -config.skill_cast_recently,
                extra: true,
            },
            { stat: 'life_cost_reduction_skill_mult', condition: (_, stats) => hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond) },
            { stat: 'aura_elemental_swap_cost_increase', condition: (_, stats) => hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond, SkillCostType.Life, SkillCostType.LifeSecond) },
            { stat: 'summon_skeleton_squire_cost_lock_reduction', condition: (_, stats) => hasCostType(stats, SkillCostType.LifeLockFlat, SkillCostType.ManaLockFlat), multiplier: () => -1 },  
            { stat: 'cost_lock_reduction', condition: (_, stats) => hasCostType(stats, SkillCostType.LifeLockFlat, SkillCostType.ManaLockFlat), multiplier: () => -1 },
            { stat: 'cost_per_second_reduction', condition: (_, stats) => hasCostType(stats, SkillCostType.LifeSecond, SkillCostType.ManaSecond), multiplier: () => -1 },
            { stat: 'cost_mult_skill_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            { stat: 'cost_reduction_mult_per_frozen_or_chilled_enemy_nearby', condition: config => config.chilled_enemy_nearby > 0, multiplier: config => - config.chilled_enemy_nearby, extra: true },
            { stat: 'cost_reduction_mult_skill_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => - config.arcanic_emblems },
            { stat: 'cost_reduction_mult_skill_per_arcanic_emblem_if_not_arcanic', condition: (config, stats) => config.arcanic_emblems > 0 && !hasStat(stats, 'skill_is_arcanic'), multiplier: config => - config.arcanic_emblems },
            { stat: 'cost_mult_skill_per_enemy_under_control', multiplier: config => -1 + config.enemy_under_command + config.elite_under_command * 10 },
            { stat: 'efficiency_skill_reduction_skill_mult', condition: config => config.efficiency_buff, multiplier: () => -1 },
            { stat: 'spectral_shape_mana_cost_override', condition: (_, stats) => getFirstStat(stats, 'activable_id') === 32 },
            { stat: 'mana_cost_mult', condition: (_, stats) => hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond) },
            {
                stat: 'increased_mana_cost_per_skeleton',
                condition: (_, stats) => !hasStat(stats, 'no_skeletons') && getFirstStat(stats, 'activable_id') === 17 && getFirstStat(stats, 'summoned_skeleton_squires', 0) > 0,
                multiplier: (_, stats) => getFirstStat(stats, 'summoned_skeleton_squires', 0)
            },
        ],
        maxMultiplier: [],
    } 
};

export const LIFE_COST_MAPPING: MergedStatMapping = {
    stat: 'life_cost',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'life_cost_add' },
            { stat: 'cost_reduction_skill_per_bleed', condition: config => config.enemy_bleed_stacks > 0, multiplier: config => - config.enemy_bleed_stacks },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'all_skill_cost_reduction_per_cast',
                condition: (config, stats) => config.skill_cast_recently > 0 && hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond, SkillCostType.Life, SkillCostType.LifeSecond),
                multiplier: config => -config.skill_cast_recently,
                extra: true,
            },           
            { stat: 'aura_elemental_swap_cost_increase', condition: (_, stats) => hasCostType(stats, SkillCostType.Mana, SkillCostType.ManaSecond, SkillCostType.Life, SkillCostType.LifeSecond) },
            { stat: 'cost_lock_reduction', condition: (_, stats) => hasCostType(stats, SkillCostType.LifeLockFlat, SkillCostType.ManaLockFlat), multiplier: () => -1 },
            { stat: 'cost_per_second_reduction', condition: (_, stats) => hasCostType(stats, SkillCostType.LifeSecond, SkillCostType.ManaSecond), multiplier: () => -1 },
            { stat: 'cost_mult_skill_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            { stat: 'cost_reduction_mult_per_frozen_or_chilled_enemy_nearby', condition: config => config.chilled_enemy_nearby > 0, multiplier: config => - config.chilled_enemy_nearby, extra: true },
            { stat: 'cost_reduction_mult_skill_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => - config.arcanic_emblems },
            { stat: 'cost_reduction_mult_skill_per_arcanic_emblem_if_not_arcanic', condition: (config, stats) => config.arcanic_emblems > 0 && !hasStat(stats, 'skill_is_arcanic'), multiplier: config => - config.arcanic_emblems },
            { stat: 'cost_mult_skill_per_enemy_under_control', multiplier: config => -1 + config.enemy_under_command + config.elite_under_command * 10 },
            { stat: 'life_cost_multiplier' }
        ],
        maxMultiplier: [],
    } 
};

export const COOLDOWN_REDUCTION_MAPPING: MergedStatMapping = 
{
    stat: 'cooldown_reduction',
    precision: 3,
    allowMinMax: false,
    suffix: '%',
    maximum: 75,
    source: {
        flat: [
            { stat: 'cooldown_reduction_percent' }
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'cooldown_reduction_global_mult' },
            { stat: 'delightful_rain_stack_cooldown_reduction_global_mult', condition: config => config.delightful_rain_stacks > 0, duplicate: (config, stats) => minAndMax(0, config.delightful_rain_stacks, getMaxStacks(stats, 'delightful_rain_max_stacks'))  },
            // this is a bug, it should increase attack speed instead
            { stat: 'exhilerating_senses_stack_attack_speed_global_mult', condition: config => config.exhilerating_senses_stacks > 0, multiplier: config => config.exhilerating_senses_stacks },
            { stat: 'arcane_clone_cooldown_reduction', condition: (_, stats) => hasStat(stats, 'cast_by_clone' ) },
            { stat: 'chrono_speed_stack_cooldown_reduction_global_mult', condition: config => config.chrono_speed_stacks > 0, multiplier: (config, stats) => Math.min(config.chrono_speed_stacks, getMaxStacks(stats, 'chrono_speed_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks')) },

            { stat: 'base_cooldown_reduction_per_temporal_emblem', condition: (config, stats) => !hasStat(stats, 'cooldown_reduction_per_temporal_emblem') && config.temporal_emblems > 0, multiplier: config => config.temporal_emblems },
            { stat: 'cooldown_reduction_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => config.temporal_emblems },

        ],
        maxMultiplier: [],
    } 
};

export const ATTACK_SPEED_MAPPING: MergedStatMapping = 
{
    stat: 'attack_speed',
    precision: 3,
    allowMinMax: false,
    suffix: '%',
    source: {
        flat: [],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'attack_speed_percent' },
            { stat: 'attack_speed_global_mult' },

            { stat: 'adam_blessing_buff_attack_speed_global_mult', condition: config => config.has_adam_blessing_buff },

            { stat: 'cooldown_reduction_global_mult_after_crit', condition: config => config.crit_recently },
            { stat: 'self_control_attack_speed_global_mult', condition: config => config.serenity > 0 && config.serenity < DELIGHTED_VALUE },
            { stat: 'banner_haste_buff_attack_speed_global_mult', condition: config => config.has_banner_haste_buff },
            { stat: 'frenzy_stack_attack_speed_global_mult', condition: config => config.frenzy_stacks > 0, duplicate: (config, stats) => minAndMax(0, config.frenzy_stacks, getMaxStacks(stats, 'frenzy_max_stacks')) },
            { stat: 'arcane_clone_attack_speed_global_mult', condition: (_, stats) => hasStat(stats, 'cast_by_clone' )},
            { stat: 'arcane_clone_attack_speed_global_mult_if_in_breach', condition: (config, stats) => hasStat(stats, 'cast_by_clone') && config.clone_is_in_breach_range },
            { stat: 'base_attack_speed_per_arcanic_emblem', condition: (config, stats) => !hasStat(stats, 'attack_speed_per_arcanic_emblem') && config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            { stat: 'attack_speed_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
            

            // retrouver chaque stat et la replacer là ou il faut
            // il faudrait mettre à jour les fichiers js
            { stat: 'arcane_flux_stack_cooldown_reduction_global_mult', condition: config => config.arcane_flux_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_flux_stacks, getMaxStacks(stats, 'arcane_flux_max_stacks')) },
            { stat: 'cooldown_reduction_global_mult_per_enfeeble_in_radius', condition: config => config.enfeeble_stacks_in_radius > 0, multiplier: config => config.enfeeble_stacks_in_radius },
            { stat: 'booster_max_cooldown_reduction_global_mult', condition: config => config.has_booster_max_buff },
            { stat: 'shadow_bargain_cooldown_reduction_global_mult', condition: config => config.has_shadow_bargain_buff },
            { stat: 'aurelon_bargain_stack_increased_attack_speed', condition: config => config.aurelon_bargain_stacks > 0,  multiplier: (config, stats) => Math.min(config.aurelon_bargain_stacks, getMaxStacks(stats, 'aurelon_bargain_max_stacks')) },
            { stat: 'overcharged_stack_cooldown_reduction_global_mult', condition: config => config.overcharged_stacks > 0,  multiplier: config => config.overcharged_stacks },
            { stat: 'cooldown_reduction_global_mult_on_combo', condition: config => config.victims_combo > 0 },
            { stat: 'cooldown_reduction_global_mult_while_curving_time_or_time_shifting', condition: config => config.is_curving_time_or_time_shifting },
            { stat: 'cooldown_reduction_global_mult_while_not_curving_time_or_time_shifting', condition: config => !config.is_curving_time_or_time_shifting },
            /*{ // Disabled due to the bloodthirst attack speed bug
                stat: 'cooldown_reduction_global_mult_per_bloodthirst_stack',
                condition: config => config.bloodthirst_stacks > 0 && config.has_blood_frenzy_buff,
                multiplier: (config, stats) => Math.max(0, Math.min(config.bloodthirst_stacks, getMaxStacks(stats, 'bloodthirst_max_stacks')))
            },*/
            {
                stat: 'wreak_havoc_cooldown_reduction_global_mult',
                multiplier: (config, stats) => - getFirstStat(stats, 'wreak_havoc_max_stacks') + Math.max(0, Math.min(config.wreak_havoc_stacks, getFirstStat(stats, 'wreak_havoc_max_stacks')))
            }
        ],
        maxMultiplier: [],
    } 
};

export const COOLDOWN_MAPPING: MergedStatMapping = {
    stat: 'cooldown_time',
    precision: 4,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'cooldown_time_add' },
            { stat: 'orb_arcane_master_cooldown_time_add', condition: (_, stats) => !hasStat(stats, 'disable_orb_arcane_master_maluses') },
            { stat: 'spectral_shape_cooldown_time', extra: true },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            //{ stat: 'turret_syndrome_reduced_cooldown_per_serenity', condition: (config, stats) => config.serenity > 0 && getFirstStat(stats, 'skill_id') === 0, multiplier: config => - minAndMax(0, config.serenity, DELIGHTED_VALUE) },
            { stat: 'cooldown_time_multiplier'},
            { stat: 'cooldown_time_reduction_multiplier', multiplier: () => -1 },
            { stat: 'cooldown_time_multiplier_if_tormented', condition: config => config.serenity <= 0 },
            { stat: 'grappling_hook_crest_shield_cooldown_time_reduction_multiplier', condition: (_, stats) => [7, 8].includes(getFirstStat(stats, 'skill_id')), multiplier: () => -1 },
            {
                stat: 'quick_silver_cooldown_time_reduction_multiplier',
                multiplier: (config, stats) => - Math.max(getFirstStat(stats, 'quick_silver_min_cooldown_time_reduction_multiplier'), getFirstStat(stats, 'quick_silver_max_cooldown_time_reduction_multiplier') - config.enemy_bleed_stacks)
            },
            { stat: 'cooldown_time_multiplier_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
            { stat: 'cooldown_time_reduction_multiplier_per_temporal_emblem_if_not_temporal', condition: (config, stats) => config.temporal_emblems > 0 && !hasStat(stats, 'skill_is_temporal'), multiplier: config => - config.temporal_emblems },
            { stat: 'cooldown_time_reduction_multiplier_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => - config.temporal_emblems },
            { stat: 'cooldown_time_muliplier_per_inner_fire', condition: config => config.active_inner_fire > 0, multiplier: config => config.active_inner_fire },
            { stat: 'spectral_shape_cooldown_time_override' },
            // currently life bargain is not affected by the cooldown reduction
            { stat: 'cooldown_time_reduction_if_life_cost', condition: (config, stats) => hasCostType(stats, SkillCostType.Life, SkillCostType.LifePercent) && (!hasStat(stats, 'activable_id') || getFirstStat(stats, 'activable_id') !== 57), multiplier: () => -1 },
        ],
        maxMultiplier: [],
    } 
}

export const AOE_INCREASED_SIZE_MAPPING: MergedStatMapping = {
    stat: 'aoe_increased_size',
    precision: 2,
    allowMinMax: false,
    suffix: '%',
    source: {
        flat: [
            { stat: 'aoe_increased_size_percent' },
            { stat: 'max_charged_aoe_increased_size_percent', condition: config => config.rift_nova_fully_charged },
            { stat: 'arcane_breach_collision_stack_aoe_increased_size_percent', condition: config => config.arcane_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_breach_collision_stacks, getMaxStacks(stats, 'breach_collision_max_stacks')) },
            { stat: 'aura_aoe_increased_size_percent', condition: (_, stats) => hasStat(stats, 'skill_is_aura') , extra: true }
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'aoe_increased_size_percent_mult' },
            { stat: 'academician_aoe_increased_size_mult' }
        ],
        maxMultiplier: [],
    } 
}

export const SKILL_AOE_INCREASED_SIZE_MAPPING: MergedStatMapping = {
    stat: 'skill_aoe_increased_size',
    precision: 3,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            { stat: 'skill_aoe_increased_size_percent_mult' },
            {
                stat: 'suport_streak_increased_aoe',
                condition: (config, stats) => hasStat(stats, 'skill_is_equipped_support'),
                multiplier: (config, stats) => 1 + (getFirstStat(stats, 'support_streak_increased_effect_per_stack', 0) * Math.max(0, Math.min(config.support_streak_stacks, getMaxStacks(stats, 'support_streak_max_stacks'))) / 100)
            }
        ],
        maxMultiplier: [],
    } 
}

// stat similaire à basic_damage avec uniquement le min de correct, mais sans dépendances au max
export const MIN_BASIC_DAMAGE: MergedStatMapping = {
    stat: 'min_basic_damage',
    precision: 0,
    allowMinMax: true,
    suffix: '',
    source: {
        flat: [
            { stat: 'min_basic_damage_add' },
            { stat: 'min_basic_damage_add_extra', extra: true },
            { stat: 'merchant_stack_min_basic_damage_add', condition: config => config.merchant_stacks > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'merchant_stack_max_stack', 0), config.merchant_stacks) }
        ],
        max: [],
        percent: [
            { stat: 'basic_damage_percent' },
            { stat: 'avatar_of_shadow_basic_damage_percent', condition: config => config.has_avatar_of_shadow_buff },
            { stat: 'burning_shadow_buff_basic_damage_percent', condition: config => config.has_burning_shadow_buff },
            { stat: 'booster_max_basic_damage_percent_percent', condition: config => config.has_booster_max_buff },
        ],
        maxPercent: [],
        multiplier: [
            { stat: 'basic_damage_percent_mult' },
            { stat: 'basic_damage_percent_global_mult' },
            { stat: 'basic_damage_global_mult' },
            { stat: 'base_damage_per_obliteration_emblem', condition: (config, stats) => !hasStat(stats, 'damage_per_obliteration_emblem') && config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
            { stat: 'damage_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },

        ],
        maxMultiplier: [],
    } 
} 

export const MAX_MANA_MAPPING: MergedStatMapping = {
    stat: 'max_mana',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'the_max_mana_add', condition: (_, stats) => !hasStat(stats, 'mana_to_life_modifiers') },
            { stat: 'character_the_max_mana_add' },
            { stat: 'overflowing_the_max_mana_add_extra', extra: true }
        ],
        max: [],
        percent: [
            { stat: 'the_max_mana_percent', condition: (_, stats) => !hasStat(stats, 'mana_to_life_modifiers') },
            {
                stat: 'chrono_manamorphosis_stack_the_max_mana_percent',
                condition: (config, stats) => config.chrono_manamorphosis_stacks > 0 && !hasStat(stats, 'mana_to_life_modifiers'),
                multiplier: (config, stats) => Math.min(config.chrono_manamorphosis_stacks, getMaxStacks(stats, 'chrono_manamorphosis_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks'))
            },
            {
                stat: 'the_max_mana_percent_per_enemy_in_breach_range',
                condition: (config, stats) => config.enemies_in_breach_range > 0 && !hasStat(stats, 'mana_to_life_modifiers'),
                multiplier: config => config.enemies_in_breach_range
            },
        ],
        maxPercent: [],
        multiplier: [
            { stat: 'the_max_mana_global_mult', condition: (_, stats) => !hasStat(stats, 'mana_to_life_modifiers') },
            { stat: 'overflowing_the_max_mana_global_mult' }
        ],
        maxMultiplier: [],
    } 
}

export const MAX_LIFE_MAPPING: MergedStatMapping = {
    stat: 'max_health',
    precision: 0,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'the_max_health_set' },
            { stat: 'the_max_mana_add', condition: (_, stats) => hasStat(stats, 'mana_to_life_modifiers') },
            { stat: 'the_max_health_add', condition: (_, stats) => stats['the_max_health_set'] === undefined }
        ],
        max: [],
        percent: [
            { stat: 'the_max_health_percent', condition: (_, stats) => stats['the_max_health_set'] === undefined },
            { stat: 'the_max_health_percent_per_totem',
                condition: (config, stats) => config.totems_under_control > 0 && stats['the_max_health_set'] === undefined,
                multiplier: config => config.totems_under_control
            },
            { stat: 'vitality_stack_the_max_health_percent', condition: (config, stats) => stats['the_max_health_set'] === undefined && config.vitality_stacks > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'vitality_max_stack'), config.vitality_stacks) },
            
            { stat: 'the_max_mana_percent', condition: (_, stats) => hasStat(stats, 'mana_to_life_modifiers') },
            {
                stat: 'chrono_manamorphosis_stack_the_max_mana_percent',
                condition: (config, stats) => config.chrono_manamorphosis_stacks > 0 && hasStat(stats, 'mana_to_life_modifiers'),
                multiplier: (config, stats) => Math.min(config.chrono_manamorphosis_stacks, getMaxStacks(stats, 'chrono_manamorphosis_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks'))
            },
            {
                stat: 'the_max_mana_percent_per_enemy_in_breach_range',
                condition: (config, stats) => config.enemies_in_breach_range > 0 && hasStat(stats, 'mana_to_life_modifiers'),
                multiplier: config => config.enemies_in_breach_range
            },
        ],
        maxPercent: [],
        multiplier: [
            { stat: 'the_max_health_global_mult', condition: (_, stats) => stats['the_max_health_set'] === undefined },
            { stat: 'the_max_mana_global_mult', condition: (_, stats) => hasStat(stats, 'mana_to_life_modifiers') },
        ],
        maxMultiplier: [],
    } 
}

export const SKILL_ADDITIONAL_DURATION: MergedStatMapping = {
    stat: 'skill_additional_duration',
    precision: 2,
    allowMinMax: false,
    suffix: '',
    source: {
        flat: [
            { stat: 'skill_duration_add' },
            { stat: 'skill_duration_reduction', multiplier: () => -1 },
            { stat: 'skill_duration_reduction_if_tormented', condition: config => config.serenity <= 0, multiplier: () => -1 },
            { stat: 'temporal_breach_collision_stack_duration_add', condition: config => config.temporal_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.temporal_breach_collision_stacks, getMaxStacks(stats, 'breach_collision_max_stacks')) },
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [
            {
                stat: 'suport_streak_increased_duration',
                condition: (config, stats) => hasStat(stats, 'skill_is_equipped_support'),
                multiplier: (config, stats) => 1 + (getFirstStat(stats, 'support_streak_increased_effect_per_stack', 0) * Math.max(0, Math.min(config.support_streak_stacks, getMaxStacks(stats, 'support_streak_max_stacks'))) / 100)
            }
        ],
        maxMultiplier: [],
    } 
}

export const RECAST_CHANCE_MAPPING: MergedStatMapping = 
{
    stat: 'recast_chance',
    precision: 1,
    allowMinMax: false,
    suffix: '%',
    source: {
        flat: [
            { stat: 'recast_chance_percent' },
            { stat: 'recast_chance_percent_if_perfect', condition: config => config.next_cast_is_perfect },
            { stat: 'recast_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
            { stat: 'recast_chance_percent_per_non_obliteration_emblem', condition: config => (config.arcanic_emblems + config.temporal_emblems) > 0, multiplier: config => config.arcanic_emblems + config.temporal_emblems },
            { stat: 'academician_recast_chance_extra', extra: true }
        ],
        max: [],
        percent: [],
        maxPercent: [],
        multiplier: [{ stat: 'academician_recast_chance_mult' }],
        maxMultiplier: [],
    } 
};

export const GLOBAL_MERGED_STATS_MAPPING: Array<MergedStatMapping> = [
    {
        stat: 'effect_rune_effect',
        precision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'effect_rune_increased_effect' },
                { 
                    stat: 'effect_rune_increased_effect_per_effective_rune_stack',
                    multiplier: (config, stats) => Math.min(config.effective_rune_stacks, getMaxStacks(stats, 'effect_rune_increased_effect_per_effective_rune_stack_max')),
                    condition: (config) => config.effective_rune_stacks > 0
                }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    // adventure
    {
        stat: 'level',
        precision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [{ stat: 'hero_level' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    SKILL_MANA_COST_MAPPING,
    SKILL_LIFE_COST_MAPPING,
    COOLDOWN_MAPPING,
    {
        stat: 'essence_find',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'essence_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_essence_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'xp_find',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'xp_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'xp_find_global_mult' }, { stat: 'academician_xp_find_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'influence_gain',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'influence_gain_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_influence_gain_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mf_find',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'mf_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_mf_find_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mf_qual',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'mf_qual_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_mf_qual_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    // max_health
    MAX_LIFE_MAPPING,
    {
        stat: 'health_regeneration',
        precision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [{ stat: 'health_regen_add' }],
            max: [],
            percent: [{ stat: 'health_regen_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'health_recovery_mult' },
                { stat: 'high_life_health_recovery_mult', condition: (config, stats) => config.percent_missing_health < (100 - getFirstStat(stats, 'reverse_life_regeneration_life_treshold', 0)) },
                { stat: 'sun_effect_health_regen_global_mult', condition: (config) => !config.moonlight_side },
                { stat: 'moon_effect_health_regen_global_mult', condition: (config) => config.moonlight_side },
                { stat: 'missing_life_orb_health_regen_global_mult', multiplier: (config, stats) => Math.max(0, getMaxStat(stats, 'max_life_orb') - Math.max(0, config.life_orbs_count)) },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'health_leech_percent',
        precision: 3,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'health_leech_percent' },
                { stat: 'health_leech_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'health_leech_percent_on_low_life_treshold', 0)) },
                { stat: 'health_leech_percent_if_perfect', condition: config => config.next_cast_is_perfect },
                { stat: 'shadow_shield_health_leech_percent', condition: config => config.has_shadow_shield_buff },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'health_recovery_mult' }, { stat: 'academician_health_leech_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'life_on_hit',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
                { stat: 'health_recovery_mult' },
                { stat: 'moon_effect_health_on_hit_global_mult', condition: config => config.moonlight_side }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'life_on_kill',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
    MAX_MANA_MAPPING,
    {
        stat: 'mana_regeneration',
        precision: 2,
        displayPrecision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'mana_regen_add' },
                { stat: 'mana_regen_add_if_delighted_and_enemy_has_latent_storm', condition: config => config.serenity >= DELIGHTED_VALUE && config.enemies_affected_by_latent_storm > 0 },
                { stat: 'mana_regen_add_per_enemy_in_breach_range', condition: config => config.enemies_in_breach_range > 0, multiplier: config => config.enemies_in_breach_range },
            ],
            max: [],
            percent: [
                { stat: 'mana_regen_percent' },
                { stat: 'focus_mana_regen_percent', condition: config => config.is_channeling_focus }
            ],
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
        suffix: '%',
        source: {
            flat: [{ stat: 'mana_leech_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'mana_leech_global_mult' }, { stat: 'academician_mana_leech_percent_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'mana_on_hit',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
        suffix: '',
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
        suffix: '',
        source: {
            flat: [
                { stat: 'the_speed_add' },
                { stat: 'the_speed_add_extra_while_not_curving_time_or_time_shifting', extra: true, condition: config => !config.is_curving_time_or_time_shifting },
            ],
            max: [],
            percent: [
                { stat: 'the_speed_percent' },
                { stat: 'the_speed_percent_after_dodge', condition: config => config.dodge_recently },
                { stat: 'assassin_haste_buff_movement_speed', condition: config => config.has_assassin_haste_buff },
                { stat: 'tormented_movement_speed', condition: config => config.serenity <= 0 },
                { stat: 'movement_speed_after_trap_triggered', condition: config => config.trap_triggered_recently },
                { stat: 'the_speed_percent_per_latent_storm', condition: config => config.enemies_affected_by_latent_storm > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'the_speed_percent_per_latent_storm_max'), config.enemies_affected_by_latent_storm) },
                { stat: 'speed_gate_buff_the_speed_percent', condition: config => config.has_speed_gate_buff },
                { stat: 'cleansing_surge_stack_movement_speed_percent', condition: config => config.cleansing_surge_stacks > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'cleansing_surge_max_stacks'), config.cleansing_surge_stacks) },
                { stat: 'the_speed_percent_on_combo', condition: config => config.victims_combo > 0 },
                { stat: 'the_speed_percent_while_curving_time_or_time_shifting', condition: config => config.is_curving_time_or_time_shifting },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'the_speed_global_mult' },
                { stat: 'the_speed_percent_in_combat', condition: config => config.in_combat },
                { stat: 'life_orb_the_speed_global_mult', condition: config => config.life_orbs_count > 0, multiplier: (config, stats) => Math.min(config.life_orbs_count, getMaxStat(stats, 'max_life_orb')) },
                { stat: 'the_speed_global_mult_while_not_curving_time_or_time_shifting', condition: config => !config.is_curving_time_or_time_shifting },
                { stat: 'movement_speed_mult_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'movement_speed_percent',
        precision: 3,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [               
                { stat: 'the_speed_percent' },
                { stat: 'the_speed_percent_after_dodge', condition: config => config.dodge_recently },
                { stat: 'assassin_haste_buff_movement_speed', condition: config => config.has_assassin_haste_buff },
                { stat: 'tormented_movement_speed', condition: config => config.serenity <= 0 },
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
    COOLDOWN_REDUCTION_MAPPING,
    ATTACK_SPEED_MAPPING,
    {
        stat: 'enemy_attack_speed',
        precision: 3,
        allowMinMax: false,
        suffix: '%',
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
        suffix: '',
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
        suffix: '%',
        source: {
            flat: [
                { stat: 'crit_chance_percent' },
                { stat: 'crit_chance_percent_if_no_enemies_around', condition: config => config.ennemies_in_radius === 0 },
                { stat: 'greed_stack_crit_chance_percent', condition: config => config.greed_stacks > 0, multiplier: config => config.greed_stacks },
                { stat: 'strider_stack_crit_chance_percent', condition: config => config.strider_stacks > 0, multiplier: config => config.strider_stacks },
                { stat: 'ancestral_fervor_buff_crit_chance_percent', condition: config => config.has_ancestral_fervor_buff },
                { stat: 'nimble_buff_crit_chance_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
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
                { stat: 'crit_chance_percent_against_burning', condition: config => config.target_is_burning && config.use_enemy_state },
                { stat: 'academician_critical_chance_extra', extra: true },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'crit_chance_global_mult' },
                { stat: 'crit_chance_global_mult_after_hit_taken', condition: config => config.took_physical_damage_recently || config.took_elemental_damage_recently },
                { stat: 'enemy_full_life_crit_chance_global_mult', condition: (config, stats) => config.use_enemy_state && (100 - config.enemy_percent_missing_health) >= getFirstStat(stats, 'enemy_full_life_crit_chance_global_mult_treshold', 0) },
                { stat: 'crit_chance_global_mult_per_yard', condition: config => config.use_enemy_state && config.distance_with_target > 0, multiplier: config => config.distance_with_target },
                { stat: 'academician_critical_chance_mult' },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'critical_damage',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'crit_damage_percent' },
                { stat: 'crit_damage_percent_for_each_ennemy', condition: config => config.ennemies_in_radius > 0, multiplier: config => config.ennemies_in_radius },
                { stat: 'nimble_buff_crit_damage_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'ancestral_instability_crit_damage_percent',
                    condition: config => config.has_ancestral_instability_buff, 
                    multiplier: (config, stats) => 1 + 0.25 * config.ancestral_instability_buff_duration
                },
                { stat: 'burning_shadow_buff_crit_damage_percent', condition: config => config.has_burning_shadow_buff },
                { stat: 'mighty_swing_cadence_whirlwind_crit_damage_percent', condition: (_, stats) => [3, 6, 9].includes(getFirstStat(stats, 'skill_id')) },
                { stat: 'crit_damage_percent_per_arcanic_emblem', condition: config => config.arcanic_emblems > 0, multiplier: config => config.arcanic_emblems },
                { stat: 'crit_damage_percent_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
                { stat: 'crit_damage_percent_while_curving_time_or_time_shifting', condition: config => config.is_curving_time_or_time_shifting },
                { stat: 'isoperimetry_crit_damage_percent_extra', condition: (_, stats) => hasStat(stats, 'critical_chance_equal_ancestral_chance') },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'crit_damage_percent_mult' }, { stat: 'academician_critical_damage_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ancestral_chance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'brut_chance_percent' },
                { stat: 'brut_chance_percent_ancestral_harmony' },
                { stat: 'ancestral_legacy_stack_brut_chance_percent',
                    condition: config => config.ancestral_legacy_stacks > 0,
                    multiplier: (config, stats) => config.ancestral_legacy_stacks
                },
                { stat: 'nimble_buff_brut_chance_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
                },
                {
                    stat: 'brut_chance_percent_while_ancestral_stab_slash_buff',
                    condition: config => config.has_ancestral_stab_slash_buff, 
                },
                { stat: 'brut_chance_percent_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => config.temporal_emblems },
                { stat: 'brut_chance_percent_per_temporal_emblem', condition: config => config.temporal_emblems > 0, multiplier: config => config.temporal_emblems },
                { stat: 'academician_ancestral_chance_extra', extra: true },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'brut_chance_global_mult' },
                { stat: 'academician_ancestral_chance_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ancestral_damage',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'brut_damage_percent' },
                { stat: 'nimble_buff_brut_damage_percent',
                    condition: config => config.has_nimble_buff, 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'ancestral_instability_brut_damage_percent',
                    condition: config => config.has_ancestral_instability_buff, 
                    multiplier: (config, stats) => 1 + 0.25 * config.ancestral_instability_buff_duration
                },
                { stat: 'brut_damage_percent_extra', extra: true },
                { stat: 'brut_damage_percent_per_ancestral_preparation_stack', condition: config => config.ancestral_preparation_stacks > 0, multiplier: config => config.ancestral_preparation_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'brut_damage_global_mult' },
                { stat: 'academician_ancestral_damage_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'armor_penetration',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'armor_penetration_percent' },
                { stat: 'idle_armor_penetration_percent', condition: config => config.idle },
                { stat: 'figther_bane_armor_penetration_percent', condition: config => config.fighter_bane_stacks > 0, multiplier: (config, stats) => Math.max(0, Math.min(config.fighter_bane_stacks, getMaxStacks(stats, 'figther_bane_max_stacks'))) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'armor_penetration_global_mult' }, { stat: 'academician_armor_penetration_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_penetration',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'elemental_penetration_percent' },
                { stat: 'mage_bane_elemental_penetration_percent', condition: config => config.mage_bane_stacks > 0, multiplier: (config, stats) => Math.max(0, Math.min(config.mage_bane_stacks, getMaxStacks(stats, 'mage_bane_max_stacks'))) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_elemental_penetration_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'dot_increased_damage',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'dot_increased_damage_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'dot_increased_damage_global_mult' }, { stat: 'academician_dot_increased_damage_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'increased_on_elite',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'increased_damage_on_elite_percent' },
                { stat: 'increased_damage_on_elite_percent_for_each_elite', condition: config => config.elites_in_radius > 0 , multiplier: config => config.elites_in_radius },
                { 
                    stat: 'apex_predator_stack_increased_damage_on_elite_percent',
                    condition: config => config.apex_predator_stacks > 0,
                    multiplier: (config, stats) => Math.min(config.apex_predator_stacks, valueOrDefault(getMaxStacks(stats, 'apex_predator_max_stacks'), 0))
                }
                 
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_increased_on_elite_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'armor',
        precision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [{ stat: 'res_phy_add' }],
            max: [],
            percent: [
                { stat: 'res_phy_percent' },
                { stat: 'res_phy_percent_per_banner', condition: config => config.banners_nearby > 0, multiplier: config => config.banners_nearby },
                { stat: 'oak_bark_armor_stack_res_phy_percent', condition: config => config.oak_bark_armor_stacks > 0, multiplier: (config, stats) => Math.min(config.oak_bark_armor_stacks, getMaxStacks(stats, 'oak_bark_armor_max_stack')) },
                { stat: 'res_phy_percent_if_channeling_ray_of_obliteration', condition: config => config.is_channeling_ray_of_obliteration },
                { stat: 'chrono_armor_stack_res_phy_percent', condition: config => config.chrono_armor_stacks > 0, multiplier: (config, stats) => Math.min(config.chrono_armor_stacks, getMaxStacks(stats, 'chrono_armor_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks')) },
                { stat: 'shadow_shield_armor_percent', condition: config => config.has_shadow_shield_buff },
                { stat: 'frostfire_armor_res_phy_percent', condition: config => config.has_frostfire_buff },
                { stat: 'figther_bane_res_phy_percent', condition: config => config.fighter_bane_stacks > 0, multiplier: (config, stats) => Math.max(0, Math.min(config.fighter_bane_stacks, getMaxStacks(stats, 'figther_bane_max_stacks'))) },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'res_phy_global_mult' },
                { stat: 'res_phy_global_mult_on_low_life',condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'res_phy_global_mult_on_low_life_treshold', 0)) },
                { stat: 'res_phy_mag_global_mult_on_low_life',condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'res_phy_mag_global_mult_on_low_life_treshold', 0)) },
                { stat: 'res_mag_armor_global_mult_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_resist',
        precision: 0,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'res_mag_add' },
                { stat: 'aura_neriya_shield_res_mag_add' }
            ],
            max: [],
            percent: [
                { stat: 'res_mag_percent' },
                { stat: 'res_mag_percent_if_channeling_ray_of_obliteration', condition: config => config.is_channeling_ray_of_obliteration },
                { stat: 'shadow_shield_elemental_resist_percent', condition: config => config.has_shadow_shield_buff },
                { stat: 'mage_bane_res_mag_percent', condition: config => config.mage_bane_stacks > 0, multiplier: (config, stats) => Math.max(0, Math.min(config.mage_bane_stacks, getMaxStacks(stats, 'mage_bane_max_stacks'))) },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'res_mag_global_mult' },
                { stat: 'res_mag_global_mult_after_elemental_damage_taken', condition: config => config.took_elemental_damage_recently },
                { stat: 'res_mag_armor_global_mult_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
                { stat: 'res_phy_mag_global_mult_on_low_life',condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'res_phy_mag_global_mult_on_low_life_treshold', 0)) },            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'fire_resistance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'fire_resistance_percent' },
                { stat: 'frostfire_armor_fire_resistance_percent', condition: config => config.has_frostfire_buff },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_fire_resistance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'ice_resistance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'ice_resistance_percent' },
                { stat: 'frostfire_armor_ice_resistance_percent', condition: config => config.has_frostfire_buff },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_ice_resistance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'lightning_resistance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'lightning_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_lightning_resistance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'light_resistance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'light_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_light_resistance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'shadow_resistance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'shadow_resistance_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_shadow_resistance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'dodge',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
                { stat: 'dodge_global_mult_if_recent_delighted_arrow_shot', condition: config => config.recent_delighted_arrow_shot }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'thorns',
        precision: 1,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'thorns_add' },
                { stat: 'thorns_add_if_idle', condition: config => config.idle, addAsNonConvertion: true }
            ],
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
        suffix: '%',
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
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'retaliate_percent' },
                { stat: 'retaliate_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'retaliate_percent_on_low_life_treshold', 0)) },
                { stat: 'golden_buff_retaliate_percent', condition: config => config.has_gold_armor_buff },
                { stat: 'retaliate_percent_on_blocked_hit', condition: config => config.is_hit_blocked },
                { stat: 'retaliate_percent_if_channeling_arcane_barrier', condition: config => config.is_channeling_arcane_barrier },
                { stat: 'revengeance_stack_retaliate_percent', condition: config => config.revengeance_stacks > 0, multiplier: config => config.revengeance_stacks },
                { stat: 'unrelenting_stack_retaliate_percent', condition: config => config.unrelenting_stacks > 0, multiplier: (config, stats) => Math.min(config.unrelenting_stacks, getMaxStacks(stats, 'unrelenting_stacks_max', 0)) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'retaliate_global_mult' },
                { stat: 'academician_retaliate_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'retaliate_critical_chance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
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
        maximum: 100,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'tenacity_percent' },
                { stat: 'tenacity_percent_while_channeling_whirlwind', condition: config => config.is_channeling_whirlwind },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_tenacity_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_all',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'reduced_damage_from_all_percent' },
                { stat: 'reduced_damage_from_all_percent_after_hit_taken',
                    condition: config => config.hits_taken_recently > 0,
                    multiplier: (config, stats) => Math.min(config.hits_taken_recently, getFirstStat(stats, 'reduced_damage_from_all_percent_after_hit_taken_max_stack', 0))
                },
                { stat: 'golden_buff_reduced_damage_from_all_percent', condition: config => config.has_gold_armor_buff },
                { stat: 'stability_stack_reduced_on_all', condition: config => config.stability_stacks > 0, multiplier: (config, stats) => Math.min(config.stability_stacks, getMaxStacks(stats, 'stability_max_stacks', 0)) }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_reduced_on_all_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_by_elite',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'reduced_damage_on_elite_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_reduced_by_elite_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_melee',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
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
            multiplier: [{ stat: 'academician_reduced_on_melee_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_projectile',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'reduced_damage_from_projectile_percent' },
                { stat: 'projectile_defense_stack_reduction', condition: config => config.projectile_defense_stacks > 0, multiplier: config => config.projectile_defense_stacks },
                { stat: 'flawless_defense_projectile_damage_reduction', condition: config => config.has_flawless_defense_buff },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_reduced_on_projectile_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reduced_on_area',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'reduced_damage_from_area_percent' },
                { stat: 'enduring_protector_buff_reduced_damage_from_area_percent', condition: config => config.has_enduring_protector_buff },
                { stat: 'aoe_defense_stack_reduction', condition: config => config.aoe_defense_stacks > 0, multiplier: config => config.aoe_defense_stacks },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_reduced_on_area_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'gold_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'gold_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'gold_find_global_mult' }, { stat: 'academician_gold_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'scrap_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'scrap_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_scrap_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'slormite_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'slormite_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_slormite_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'slormeline_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'slormeline_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_slormeline_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reaper_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [{ stat: 'reaper_find_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_reaper_find_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'reaper_xp_find',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
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
        suffix: '%',
        source: {
            flat: [{ stat: 'skill_mastery_gain_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_skill_mastery_gain_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_chance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'inner_fire_chance_percent' },
                { stat: 'inner_fire_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
                { stat: 'academician_inner_fire_chance_extra', extra: true }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_inner_fire_chance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_max_number',
        precision: 2,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'inner_fire_max_number_add' },
                { stat: 'inner_fire_max_number_add_extra', extra: true },
                { stat: 'conquest_stack_inner_fire_max_number_add', condition: config => config.conquest_stacks > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'conquest_max_stacks', 0), config.conquest_stacks) }
            ],
            max: [],
            percent: [{ stat: 'inner_fire_max_number_percent' }],
            maxPercent: [],
            multiplier: [{ stat: 'inner_fire_max_number_global_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'inner_fire_duration',
        precision: 2,
        allowMinMax: false,
        suffix: 's',
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
        precision: 0,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: [
                { stat: 'inner_fire_damage_add' },
                { stat: 'overdrive_inner_fire_additional_damage_when_triggered_by_book_smash', extra: true, condition: config => config.is_triggered_by_book_smash },
                { stat: 'inner_fire_damage_add_extra' },
                { stat: 'elder_inner_fire_damage_add_extra', extra: true, condition: config => config.show_elder_inner_fire_damage },
            ],
            max: [],
            percent: [
                { stat: 'inner_fire_damage_percent' },
                { stat: 'concentration_buff_inner_fire_damage_percent', condition: config => config.concentration_buff },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'inner_fire_damage_mult_if_channeling_whirlwind', extra: true, condition: (config, stats) => config.is_channeling_whirlwind && !hasStat(stats, 'no_longer_cost_per_second') },
                { stat: 'inner_weakness_increased_damage', extra: true, condition: config => config.use_enemy_state && config.enemy_inner_weakness_stacks > 0 , multiplier: (config, stats) => Math.min(config.enemy_inner_weakness_stacks, getMaxStacks(stats, 'inner_weakness_max_stacks')) }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'shield_globe_value',
        precision: 2,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: [
                { stat: 'shield_globe_value_add' },
                { stat: 'shield_globe_value_add_extra', extra: true },
            ],
            max: [],
            percent: [
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'shield_increased_value_mult' },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'overdrive_chance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'overdrive_chance_percent' },
                { stat: 'overdrive_chance_percent_if_fortunate_or_perfect', condition: config => config.next_cast_is_perfect || config.next_cast_is_fortunate },
                { stat: 'overdrive_chance_percent_if_next_cast_is_new_emblem', condition: (config, stats) => config.next_cast_is_new_emblem && hasStat(stats, 'skill_is_melee') },
                { stat: 'overdrive_chance_percent_while_channeling_ray_of_obliteration', condition: (config) => config.is_channeling_ray_of_obliteration },
                { stat: 'academician_overdrive_chance_extra', extra: true },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_overdrive_chance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'overdrive_bounce_number',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
        precision: 0,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: [
                { stat: 'overdrive_damage_add' },
                { stat: 'overdrive_inner_fire_additional_damage_when_triggered_by_book_smash', extra: true, condition: config => config.is_triggered_by_book_smash },
            ],
            max: [],
            percent: [{ stat: 'overdrive_damage_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'overdrive_damage_global_mult', extra: true },
                { stat: 'overdrive_damage_global_mult_per_bounce_left', extra: true, condition: config => config.overdrive_bounces_left > 0, multiplier: config => config.overdrive_bounces_left },
                { stat: 'overdrive_damage_global_mult_last_bounce', extra: true, condition: config => config.overdrive_last_bounce }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'recast_chance_minus_100',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [ 
                { stat: 'recast_chance_minus_100_add', extra: true },
                ...RECAST_CHANCE_MAPPING.source.flat
            ],
            max: [ ...RECAST_CHANCE_MAPPING.source.max ],
            percent: [ ...RECAST_CHANCE_MAPPING.source.percent ],
            maxPercent: [ ...RECAST_CHANCE_MAPPING.source.maxPercent ],
            multiplier: [ ...RECAST_CHANCE_MAPPING.source.multiplier ],
            maxMultiplier: [ ...RECAST_CHANCE_MAPPING.source.maxMultiplier ],
        } 
    },
    RECAST_CHANCE_MAPPING,
    {
        stat: 'knockback_melee',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'knockback_melee_add' },
                { stat: 'knockback_melee_percent' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_knockback_melee_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'additional_projectile',
        precision: 2,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'additional_projectile_add' },
                { stat: 'idle_additional_projectile_add', condition: config => config.idle },
                { stat: 'tormented_additional_projectile_add', condition: config => config.serenity <= 0 },
                { stat: 'perfect_additional_projectile_add', condition: config => config.next_cast_is_perfect },
                { stat: 'additional_projectile_add_if_next_cast_is_new_emblem', condition: (config, stats) => config.next_cast_is_new_emblem && hasStat(stats, 'skill_is_projectile') },
                { stat: 'arcane_stack_additional_projectile_add', condition: config => config.arcane_stacks > 0, multiplier: (config, stats) => Math.min(config.arcane_stacks, getMaxStacks(stats, 'arcane_max_stacks')) },
            ],
            max: [],
            percent: [{ stat: 'additional_projectile_percent' }],
            maxPercent: [],
            multiplier: [
                { stat: 'idle_additional_projectile_global_mult', condition: config => config.idle },
                { stat: 'not_idle_additional_projectile_global_mult', condition: config => !config.idle },
                { stat: 'additional_projectile_global_mult' },
            ],
            maxMultiplier: [],
        } 
    },
    CHANCE_TO_PIERCE,
    {
        stat: 'fork_chance',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'fork_chance_percent' },
                { stat: 'fork_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'arrow_shot_fork_chance_percent', condition: (_, stats) => getFirstStat(stats, 'skill_id') === 3 },
                { stat: 'academician_fork_chance_extra', extra: true }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'fork_chance_global_mult' }, { stat: 'academician_fork_chance_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'chance_to_rebound',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'rebound_chance_percent' },
                { stat: 'rebound_chance_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'arrow_shot_rebound_chance_percent', condition: (_, stats) => getFirstStat(stats, 'skill_id') === 3 },
                { stat: 'rebound_chance_percent_if_fully_charged', condition: config => config.void_arrow_fully_charged },
                { stat: 'academician_chance_to_rebound_extra', extra: true },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'rebound_chance_global_mult' },
                { stat: 'academician_chance_to_rebound_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'projectile_speed',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'increased_proj_speed_percent' },
                { stat: 'increased_proj_speed_percent_on_low_life', condition: (config, stats) => config.percent_missing_health > (100 - getFirstStat(stats, 'pierce_fork_rebound_proj_speed_on_low_life_treshold', 0)) },
                { stat: 'increased_proj_speed_percent_if_tormented', condition: (config) => config.serenity <= 0},
                { stat: 'increased_proj_speed_percent_if_projectile_passed_through_wall_of_omen', condition: (config, stats) => config.projectile_passed_through_wall_of_omen && hasStat(stats, 'skill_is_projectile')},
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_projectile_speed_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'knockback_projectile',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'knockback_projectile_add' },
                { stat: 'knockback_projectile_percent' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_knockback_projectile_mult' }],
            maxMultiplier: [],
        } 
    },
    AOE_INCREASED_SIZE_MAPPING,
    {
        stat: 'aoe_increased_effect',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'aoe_increased_effect_percent' },
                { stat: 'aoe_increased_effect_percent_on_low_mana', condition: (_, stats) => getFirstStat(stats, 'percent_missing_mana', 0) > (100 - getFirstStat(stats, 'aoe_increased_effect_percent_on_low_mana_treshold', 0)) }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'aoe_increased_effect_global_mult' },
                { stat: 'academician_aoe_increased_effect_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'totem_increased_effect',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'totem_increased_effect_percent' },
                { stat: 'totem_dexterity_totem_increased_effect_percent', condition: config => config.totem_dexterity_stacks > 0, multiplier: (config, stats) => Math.min(getMaxStacks(stats, 'totem_dexterity_max_stack', 0), config.totem_dexterity_stacks) }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [{ stat: 'academician_totem_increased_effect_mult' }],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'totem_increased_damage',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'totem_increased_damage_percent' },
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
        suffix: '%',
        source: {
            flat: [{ stat: 'aura_increased_effect_percent' }],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'academician_aura_increased_effect_mult' },
                { stat: 'aura_increased_effect_global_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'minion_increased_damage',
        precision: 2,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
                { stat: 'minion_increased_damage_percent' },
                { stat: 'minion_increased_damage_percent_necromancy', addAsNonConvertion: true },
                { stat: 'minion_increased_damage_percent_per_controlled_minion', condition: (config, stats) => getMinionsUnderYourControl(stats, config) > 0, multiplier: (config, stats) => getMinionsUnderYourControl(stats, config) },
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'minion_increased_damage_global_mult' },
                { stat: 'academician_minion_increased_damage_mult' }
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'elemental_damage',
        precision: 0,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: [
                { stat: 'min_elemental_damage_add' },
                { stat: 'weapon_to_elemental_damage' },
                { stat: 'elemental_emergency_min_elemental_damage_add_on_low_life', condition: (config, stats) => getFirstStat(stats, 'percent_missing_health', 0) > (100 - getFirstStat(stats, 'elemental_emergency_min_elemental_damage_add_on_low_life_treshold', 0)) },
                { stat: 'elemental_resources_min_elemental_damage_add_on_low_mana', condition: (config, stats) => getFirstStat(stats, 'percent_missing_mana', 0) > (100 - getFirstStat(stats, 'elemental_resources_min_elemental_damage_add_on_low_mana_treshold', 0)) },
                { stat: 'enligntment_stack_min_elemental_damage_add', condition: config => config.enlightenment_stacks > 0, multiplier: config => Math.min(config.enlightenment_stacks, 999) }
            ],
            max: [{ stat: 'max_elemental_damage_add' }],
            percent: [
                { stat: 'elemental_damage_percent' },
                { stat: 'avatar_of_shadow_elemental_damage_percent', condition: config => config.has_avatar_of_shadow_buff },
                { stat: 'elemental_prowess_elemental_damage_percent', condition: config => config.has_elemental_prowess_buff },
                { stat: 'legendary_elemental_damage_percent', condition: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) > 0, multiplier: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', 0) },
                { stat: 'elemental_temper_buff_elemental_damage_percent', condition: config => config.has_elemental_temper_buff },
                { stat: 'aura_elemental_swap_elemental_damage_percent' },
                { stat: 'elemental_damage_percent_for_each_negative_effect_on_ennemies', condition: config => config.negative_effects_on_ennemies_in_radius > 0, multiplier: config => config.negative_effects_on_ennemies_in_radius },
                { stat: 'invigorate_stack_elemental_damage_percent', condition: config => config.invigorate_stacks > 0, multiplier: (config, stats) => Math.min(config.invigorate_stacks, getMaxStacks(stats, 'invigorate_max_stacks'))},
                { stat: 'elemental_spirit_stack_elemental_damage_percent', condition: config => config.elemental_spirit_stacks > 0, multiplier: (config, stats) => Math.min(config.elemental_spirit_stacks, getMaxStacks(stats, 'elemental_spirit_max_stacks'))},
                { stat: 'elemental_damage_percent_per_active_aura', condition: (config, stats) => getFirstStat(stats, 'active_aura_count') > 0, multiplier: (config, stats) => getFirstStat(stats, 'active_aura_count') },
                { stat: 'booster_max_elemental_damage_percent', condition: config => config.has_booster_max_buff },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'elemental_damage_mult' },
                { stat: 'elemental_damage_global_mult' },
                { stat: 'elemental_fervor_buff_elemental_damage_global_mult', condition: config => config.has_elemental_fervor_buff },
                { stat: 'elemental_weakness_stack_elemental_damage_mult',
                    condition: (config, stats) => config.elemental_weakness_stacks > 0 && hasStat(stats, 'skill_id') && [getFirstStat(stats, 'primary_skill'), getFirstStat(stats, 'secondary_skill')].includes(4),
                    multiplier: (config, stats) => Math.min(config.elemental_weakness_stacks, getFirstStat(stats, 'elemental_weakness_max_stacks')) },
                { stat: 'base_damage_per_obliteration_emblem', condition: (config, stats) => !hasStat(stats, 'damage_per_obliteration_emblem') && config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
                { stat: 'damage_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'basic_damage',
        precision: 0,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: MIN_BASIC_DAMAGE.source.flat,
            max: [{ stat: 'max_basic_damage_add' }],
            percent: MIN_BASIC_DAMAGE.source.percent,
            maxPercent: [{ stat: 'max_basic_damage_percent' }],
            multiplier: MIN_BASIC_DAMAGE.source.multiplier,
            maxMultiplier: [],
        } 
    },
    MIN_BASIC_DAMAGE,
    {
        stat: 'weapon_damage',
        precision: 0,
        allowMinMax: true,
        suffix: '',
        source: {
            flat: [
                { stat: 'min_weapon_damage_add' },
                { stat: 'blood_frenzy_min_weapon_damage_add', condition: config => config.has_blood_frenzy_buff }
            ],
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
        suffix: '',
        source: {
            flat: [
                { stat: 'basic_to_physical_damage' }, 
                { stat: 'weapon_to_physical_damage' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'sum_all_resistances',
        precision: 0,
        allowMinMax: false,
        suffix: '',
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
        suffix: '',
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
        suffix: '',
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
        suffix: '',
        source: {
            flat: [
                { stat: 'additional_damage_add' },
                { stat: 'primary_skill_additional_damages', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') },
                { stat: 'primary_secondary_skill_additional_damage', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary') },
                { stat: 'moon_effect_primary_secondary_skill_additional_damage', condition: (config, stats) => config.moonlight_side && (hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary')) },
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
        suffix: '%',
        source: {
            flat: [
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'nimble_buff_primary_skill_increased_damages',
                    condition: (config, stats) => config.has_nimble_buff && hasStat(stats, 'skill_is_equipped_primary'), 
                    multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
                },
                { stat: 'increased_damage_for_each_yard_with_target', condition: config => config.use_enemy_state && config.distance_with_target > 0, multiplier:  config => config.distance_with_target },
                { stat: 'exposed_armor_primary_secondary_skill_increased_damage_mult', condition: (config, stats) => config.exposed_armor_buff && (hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary')) },
                { stat: 'melee_skill_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_melee') },
                { stat: 'light_arrow_increased_damage' },
                { stat: 'isolated_target_increased_damage', condition: config => config.use_enemy_state && config.target_is_isolated },
                { stat: 'negative_effect_target_increased_damage', condition: config => config.use_enemy_state && config.target_negative_effects > 0 },
                { 
                    stat: 'increased_damage_per_negative_effect',
                    condition: (config, stats) => config.use_enemy_state && config.target_negative_effects > 0 && statHasValue(stats, 'skill_elements', SkillElement.Light),
                    multiplier: config => config.target_negative_effects
                },
                { stat: 'close_target_increased_damage', condition: (config, stats) => config.use_enemy_state && config.distance_with_target <= getFirstStat(stats, 'close_target_radius') },
                { stat: 'smoke_screen_buff_increased_damage', condition: config => config.has_smoke_screen_buff },
                { stat: 'increased_damage_per_rebound', condition: config => config.rebounds_before_hit > 0, multiplier: config => config.rebounds_before_hit },
                { stat: 'first_hit_after_rebound_increased_damage', condition: config => config.rebounds_before_hit > 0 && config.is_first_arrow_shot_hit },
                { stat: 'increased_damage_per_pierce', condition: config => config.pierces_before_hit > 0, multiplier: config => config.pierces_before_hit },
                { stat: 'increased_damage_mult' },
                { stat: 'decreased_damage', multiplier: () => -1 },
                { stat: 'increased_damage_per_volley_before', condition: config => config.is_last_volley, multiplier: (_, stats) => getFirstStat(stats, 'additional_volleys') },
                { stat: 'latent_storm_stack_increased_damage', condition: config => config.target_latent_storm_stacks > 0, multiplier: (config, stats) => Math.min(config.target_latent_storm_stacks, getMaxStacks(stats, 'latent_storm_max_stacks')) },
                { stat: 'increased_damage_mult_if_fully_charged', condition: (config, stats) => config.void_arrow_fully_charged && hasStat(stats, 'max_charge'), multiplier: (_, stats) => getMaxStat(stats, 'max_charge') },
                { stat: 'increased_damage_mult_per_target_left_health_percent', condition: config => config.use_enemy_state && config.enemy_percent_missing_health < 100, multiplier: config => 100 - config.enemy_percent_missing_health },
                { stat: 'increased_damage_mult_per_target_missing_health_percent', condition: config => config.use_enemy_state && config.enemy_percent_missing_health > 0, multiplier: config => config.enemy_percent_missing_health },
                { stat: 'increased_damage_if_target_is_skewered', condition: config => config.target_is_skewered },
                { stat: 'increased_damage_if_not_fortunate_or_perfect', condition: config => !config.next_cast_is_fortunate && !config.next_cast_is_perfect },
                { stat: 'chivalry_low_life_reduced_damage', condition: (config, stats) => config.use_enemy_state && getFirstStat(stats, 'chivalry_low_life_treshold') > (100 - config.enemy_percent_missing_health), multiplier: () => -1 },
                { stat: 'chivalry_high_life_increased_damage', condition: (config, stats) => config.use_enemy_state && getFirstStat(stats, 'chivalry_high_life_treshold') < (100 - config.enemy_percent_missing_health) },
                { stat: 'increased_damage_mult_if_no_legendaries', condition: (_, stats) => getFirstStat(stats, 'number_equipped_legendaries', -1) === 0 },
                { stat: 'increased_damage_mult_on_splintered_enemy', condition: config => config.enemy_splintered_stacks > 0, multiplier: (config, stats) => 1 + Math.max(0, Math.min(config.enemy_splintered_stacks, getMaxStacks(stats, 'splintered_max_stacks', 1)) - 1) * getFirstStat(stats, 'splintered_stack_increased_effect') / 100 },
                { stat: 'increased_damage_if_fortunate_or_perfect', condition: config => config.next_cast_is_fortunate || config.next_cast_is_perfect },
                { stat: 'increased_damage_mult_if_target_is_time_locked', condition: config => config.target_is_time_locked },
                { stat: 'remnant_damage_reduction_mult', condition: config => config.is_remnant },
                { stat: 'remnant_increased_damage_mult', condition: config => config.is_remnant },
                { stat: 'remnant_vulnerability_remnant_increased_damage_mult', condition: config => config.is_remnant && config.target_has_remnant_vulnerability },
                /*{ // blood frenzy damage bonus is currently not visible in stats
                    stat: 'increased_damage_mult_per_bloodthirst_stack',
                    condition: config => config.bloodthirst_stacks > 0 && config.has_blood_frenzy_buff,
                    multiplier: (config, stats) => Math.max(0, Math.min(config.bloodthirst_stacks, getMaxStacks(stats, 'bloodthirst_max_stacks')))
                },*/
                { 
                    stat: 'enfeeble_stack_increased_damage',
                    condition: config => config.enemy_enfeeble_stacks > 0 && config.use_enemy_state,
                    multiplier: (config, stats) => Math.min(config.enemy_enfeeble_stacks, valueOrDefault(getMaxStacks(stats, 'enfeeble_max_stacks'), 0))
                },
                {
                    stat: 'aoe_primary_secondary_support_damage_mult',
                    condition: (config, stats) => hasStat(stats, 'skill_is_aoe') && (hasStat(stats, 'skill_is_equipped_support') || hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary'))
                },
                {
                    stat: 'suport_streak_increased_damage',
                    condition: (config, stats) => hasStat(stats, 'skill_is_equipped_support') && (getFirstStat(stats, 'hero_class', 0) !== HeroClass.Warrior || getFirstStat(stats, 'skill_id', 0) !== 2) ,
                    multiplier: (config, stats) => 1 + (getFirstStat(stats, 'support_streak_increased_effect_per_stack', 0) * Math.max(0, Math.min(config.support_streak_stacks, getMaxStacks(stats, 'support_streak_max_stacks'))) / 100)
                },
                { stat: 'non_projectile_increased_damage_mult', condition: (_, stats) => !hasStat(stats, 'skill_is_projectile'), multiplier: () => -1 },
                { stat: 'increased_damage_while_curving_time_or_time_shifting', condition: config => config.is_curving_time_or_time_shifting },
                // non pris en compte { stat: 'skill_increased_damage_if_mana_full', condition: (_, stats) => getFirstStat(stats, 'percent_missing_mana', 0) === 0  },
                { stat: 'increased_damage_per_poison_upgrade', condition: (_, stats) => getFirstStat(stats, 'poison_upgrades', 0) > 0, multiplier: (_, stats) => getFirstStat(stats, 'poison_upgrades', 0)  },
                { stat: 'area_projectile_increased_damage', condition: (_, stats) => hasStat(stats, 'skill_is_aoe') && hasStat(stats, 'skill_is_projectile')  },
            ],
            maxMultiplier: [
            ],
        } 
    },
    {
        stat: 'skill_increased_damages',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
            ],
            max: [],
            percent: [
                { stat: 'increased_damage_per_power', condition: (_, stats) => getFirstStat(stats, 'max_power', 0) > 0, multiplier: (config, stats) => Math.min(config.ray_of_obliteration_power, getFirstStat(stats, 'max_power', 0)) },
            ],
            maxPercent: [],
            multiplier: [
                { stat: 'skill_decreased_damage_mult', multiplier: () => -1 },
                { stat: 'skill_increased_damage_mult' },
                { stat: 'skill_and_enemy_under_control_increased_damage_mult' },
                { stat: 'primary_secondary_skill_increased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary')},
                { stat: 'primary_secondary_skill_decreased_damage_mult', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary') || hasStat(stats, 'skill_is_equipped_secondary'), multiplier: () => -1},
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
                    multiplier: (config, stats) => Math.min(config.chrono_empower_stacks, getMaxStacks(stats, 'chrono_empower_max_stacks') + getFirstStat(stats, 'increased_max_chrono_stacks'))
                },
                { stat: 'traumatized_stack_double_damages', condition: config => config.enemy_traumatized_stacks > 0, multiplier: (config, stats) => Math.pow(2, Math.min(config.enemy_traumatized_stacks, getMaxStacks(stats, 'traumatized_max_stacks'))) },
                { stat: 'obliteration_breach_stack_skill_increased_damage_mult', condition: config => config.obliteration_breach_collision_stacks > 0, multiplier: (config, stats) => Math.min(config.obliteration_breach_collision_stacks, getMaxStacks(stats, 'breach_collision_max_stacks')) },
                { stat: 'skill_increased_damage_mult_per_obliteration_emblem', condition: config => config.obliteration_emblems > 0, multiplier: config => config.obliteration_emblems },
                { stat: 'orb_arcane_master_skill_decreased_damage_mult', condition: (_, stats) => !hasStat(stats, 'disable_orb_arcane_master_maluses'), multiplier: () => -1 },
                { stat: 'skill_decreased_damage_mult_if_only_obliteration', condition: config => config.temporal_emblems === 0 && config.arcanic_emblems === 0 },
                { stat: 'lightning_imbued_skill_increased_damage', condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Lightning) },
                { stat: 'light_imbued_skill_increased_damage', condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Light) },
                { stat: 'shadow_imbued_skill_increased_damage', condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Shadow) },
                { stat: 'ice_imbued_skill_increased_damage', condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Ice) },
                { stat: 'fire_imbued_skill_increased_damage', condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Fire) },
                {
                    stat: 'imbued_skill_increased_damage',
                    condition: (_, stats) => statHasValue(stats, 'skill_elements', SkillElement.Shadow)
                                          || statHasValue(stats, 'skill_elements', SkillElement.Fire)
                                          || statHasValue(stats, 'skill_elements', SkillElement.Ice)
                                          || statHasValue(stats, 'skill_elements', SkillElement.Light)
                                          || statHasValue(stats, 'skill_elements', SkillElement.Lightning)
                                          || statHasValue(stats, 'skill_elements', SkillElement.Shadow)
                },
                {
                    stat: 'imbued_skill_increased_damage_per_elemental_fury_stack',
                    condition: (config) => config.elemental_fury_stacks > 0,
                    multiplier: (config, stats) => Math.max(0, Math.min(config.elemental_fury_stacks, getMaxStacks(stats, 'elemental_fury_max_stacks')))
                },
                { stat: 'primary_skill_increased_damage', condition: (_, stats) => hasStat(stats, 'skill_is_equipped_primary')},
                { stat: 'imbued_skills_and_ancestral_beam_increased_damage_per_imbue', condition: (_, stats) => hasStat(stats, 'skill_elements'), multiplier: (_, stats) => getFirstStat(stats, 'equipped_imbues', 0)},
                { stat: 'chill_frozen_increased_damage', condition: (config, stats) => config.use_enemy_state && config.enemy_is_chill_or_frozen},
                { stat: 'increased_damage_mult_per_inner_fire', condition: config => config.active_inner_fire > 0, multiplier: config => config.active_inner_fire },
            ],
            maxMultiplier: [
                { stat: 'skill_increased_max_damage_mult' },
            ],
        } 
    },
    {
        stat: 'lightning_increased_damages',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
        source: {
            flat: [
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [
                { stat: 'electrify_increased_lightning_damage', condition: config => config.has_electrify_buff },
            ],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'increased_damage_taken',
        precision: 1,
        allowMinMax: false,
        suffix: '%',
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
    SKILL_ADDITIONAL_DURATION,
    SKILL_AOE_INCREASED_SIZE_MAPPING,
    {
        stat: 'lightning_upper_damage_range',
        precision: 1,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'upper_damage_range' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'all_masteries',
        precision: 1,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'all_character_masteries' },
                { stat: 'all_masteries_accross_characters', multiplier: config => config.other_characters_mastery_total }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    {
        stat: 'aura_aoe_increased_size_percent',
        precision: 1,
        allowMinMax: false,
        suffix: '',
        source: {
            flat: [
                { stat: 'aura_aoe_increased_size_percent' }
            ],
            max: [],
            percent: [],
            maxPercent: [],
            multiplier: [],
            maxMultiplier: [],
        } 
    },
    ...SKILL_MASTERY_LEVEL_MAPPING
];

export const HERO_MERGED_STATS_MAPPING: GameHeroesData<Array<MergedStatMapping>> = {
    0: [
        {
            stat: 'skewer_max_stacks',
            precision: 0,
            allowMinMax: false,
            suffix: '',
            source: {
                flat: [
                    { stat: 'skewer_max_stack_add' },
                    { stat: 'increased_max_stacks' }
                ],
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
            suffix: '%',
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
            suffix: '%',
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
            suffix: '',
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
            suffix: '',
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
            suffix: '',
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
            suffix: '',
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
            stat: 'trap_arm_time',
            precision: 3,
            allowMinMax: true,
            suffix: '',
            source: {
                flat: [{ stat: 'trap_arm_time_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'trap_arm_time_reduction_mult', multiplier: () => -1 }
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'poison_damage',
            precision: 3,
            allowMinMax: true,
            suffix: '',
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
            suffix: '',
            source: {
                flat: [
                    { stat: 'arcane_bond_damage_add' },
                    { stat: 'arcane_bond_damage_add_from_restored_mana', condition: (_, stats) => hasStat(stats, 'percent_restored_mana_as_arcane_bond_damage'), multiplier: (_, stats) => getFirstStat(stats, 'percent_restored_mana_as_arcane_bond_damage') / 100 },
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
            stat: 'arcane_bond_duration',
            precision: 0,
            allowMinMax: false,
            suffix: '',
            source: {
                flat: [
                    { stat: 'arcane_bond_duration_add' },
                ],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'time_lock_duration',
            precision: 0,
            allowMinMax: false,
            suffix: '',
            source: {
                flat: [
                    { stat: 'time_lock_duration_add' },
                ],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'remnant_decreased_damage',
            precision: 0,
            allowMinMax: false,
            suffix: '%',
            source: {
                flat: [
                    { stat: 'remnant_damage_reduction_mult' },
                ],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                    { stat: 'remnant_increased_damage_mult', multiplier: () => -1 },
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'max_arcane_clone',
            precision: 0,
            allowMinMax: false,
            suffix: '',
            source: {
                flat: [{ stat: 'max_arcane_clone_add' }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                ],
                maxMultiplier: [],
            } 
        },
        {
            stat: 'max_emblems',
            precision: 0,
            allowMinMax: true,
            suffix: '',
            source: {
                flat: [
                    { stat: 'max_emblems_add' },
                ],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [
                ],
                maxMultiplier: [],
            } 
        },
    ],
}

export const SKILL_MERGED_STATS_MAPPING: GameHeroesData<{ [key: number]: Array<MergedStatMapping>}> = {
    0: {
        5: [
            {
                stat: 'bleed_increased_damage',
                precision: 0,
                allowMinMax: false,
                suffix: '%',
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
                suffix: '',
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
                suffix: '',
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
                suffix: '',
                source: {
                    flat: [
                        { stat: 'brut_damage_percent' },
                        { stat: 'nimble_buff_brut_damage_percent',
                            condition: config => config.has_nimble_buff, 
                            multiplier: (config, stats) => 1 + (valueOrDefault(getFirstStat(stats, 'nimble_champion_percent'), 100) / 100) * Math.min(config.nimble_champion_stacks, valueOrDefault(getMaxStacks(stats, 'nimble_champion_max_stacks'), 0))
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
                suffix: '%',
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
                suffix: '%',
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
                suffix: '',
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
                suffix: '',
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
                suffix: '%',
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
                suffix: '',
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
                suffix: '%',
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
                suffix: '%',
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
                suffix: '%',
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
                suffix: '',
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

export const REAPER_STATS_MAPPING: { [key: number]: Array<MergedStatMapping>} = {
    28: [
        {
            stat: 'aura_equipped_per_aura_active',
            precision: 1,
            allowMinMax: false,
            suffix: '',
            source: {
                flat: [{ 
                    stat: 'aura_equipped_per_aura_active_add',
                    condition: (_, stats) => getFirstStat(stats, 'active_aura_count', 0) > 0,
                    multiplier: (_, stats) => getFirstStat(stats, 'active_aura_count', 0)
                }],
                max: [],
                percent: [],
                maxPercent: [],
                multiplier: [{
                    stat: 'aura_equipped_per_aura_equipped_multiplier',
                    condition: (_, stats) => getFirstStat(stats, 'equipped_active_aura_count', 0) > 0,
                    multiplier: (_, stats) => getFirstStat(stats, 'equipped_active_aura_count', 0)
                    
                }],
                maxMultiplier: [],
            } 
        },
    ]
}