import { DataSkill } from '../../../model/content/data/data-skill';
import {
    AbstractEffectValue,
    EffectValueConstant,
    EffectValueSynergy,
    EffectValueVariable,
} from '../../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../../model/content/enum/mechanic-type';
import { SkillCostType } from '../../../model/content/enum/skill-cost-type';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import { isEffectValueSynergy } from '../../../util/utils';

function setUpgrade(values: Array<AbstractEffectValue>, index: number, upgrade: number) {
    const value = <EffectValueVariable | EffectValueSynergy>values[index];

    if (value && typeof value.upgrade === 'number') {
        value.upgrade = upgrade;
    }
}

function setValue(values: Array<AbstractEffectValue>, index: number, newValue: number) {
    const value = <EffectValueVariable | EffectValueConstant>values[index];

    if (value && typeof value.value === 'number') {
        value.value = newValue;
        value.baseValue = newValue;
    }
}

function setStat(values: Array<AbstractEffectValue>, index: number, stat: string) {
    const value = <EffectValueVariable | EffectValueConstant>values[index];

    if (value) {
        value.stat = stat;
    }
}

function setSynergyPrecision(values: Array<AbstractEffectValue>, index: number, precision: number) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        value.precision = precision;
    }
}

function setSynergyAllowMinMax(values: Array<AbstractEffectValue>, index: number, allowMinMax: boolean) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        value.allowMinMax = allowMinMax;
    }
}

function setSource(values: Array<AbstractEffectValue>, index: number, source: string) {
    const value = <AbstractEffectValue>values[index];

    if (isEffectValueSynergy(value)) {
        value.source = source;
    }
}

function setAsUpgrade(values: Array<AbstractEffectValue>, index: number) {
    const value = <EffectValueVariable | EffectValueConstant>values[index];

    if (value) {
        value.valueType = EffectValueValueType.Upgrade;
    }
}

function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType))
}

function synergyMultiply100(values: Array<AbstractEffectValue>, index: number) {

    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        value.baseValue = value.baseValue * 100;
        value.upgrade = value.upgrade * 100;
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}


export const DATA_SKILL_0: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 8, false, EffectValueValueType.Duration, 'banner_duration');
            addConstant(values, 2.5, false, EffectValueValueType.AreaOfEffect, 'banner_aoe');
            setStat(values, 0, 'banner_provocation_banner_max_health');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'banner_regeneration_buff_health_on_hit_add');
            setAsUpgrade(values, 1);
            setStat(values, 2, 'banner_haste_buff_cooldown_reduction_global_mult');
            setAsUpgrade(values, 2);
            setStat(values, 3, 'banner_sluggishness_slow');
            setAsUpgrade(values, 3);
        },
        additionalClassMechanics: [],
        specialization: 219
    },
    1: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 4);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
        },
        additionalClassMechanics: [],
        specialization: 220
    },
    2: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 2);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
        },
        additionalClassMechanics: [],
        specialization: 221
    },
    3: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 4);
        },
        additionalClassMechanics: []
    },
    4: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 5);
        },
        additionalClassMechanics: []
    },
    5: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 2);
            setSource(values, 1, 'physical_damage');
            setStat(values, 1, 'bleed_damage');
            setUpgrade(values, 1, 14);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'bleed_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'bleed_max_stacks');
        },
        additionalClassMechanics: []
    },
    6: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 5);
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 1, 7);
            addConstant(values, 8, false, EffectValueValueType.Upgrade, 'cadence_cast_count');
        },
        additionalClassMechanics: []
    },
    7: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 6);
        },
        additionalClassMechanics: []
    },
    8: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 6);
        },
        additionalClassMechanics: []
    },
    9: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 2);
        },
        additionalClassMechanics: []
    },
    10: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 1, 7);
        },
        additionalClassMechanics: []
    },
    11: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    12: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'daze_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'daze_duration');
        },
        additionalClassMechanics: []
    },
    13: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'skewer_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skewer_chance_if_perfect');
        },
        additionalClassMechanics: []
    },
    14: {
        masteryRequired: 3,
        override: values => {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    15: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'health_leech_percent_if_perfect')
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    16: {
        masteryRequired: 4,
        override: values => { 
            setStat(values, 0, 'overdrive_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'overdrive_chance_percent_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    17: {
        masteryRequired: 4,
        override: values => { 
            setStat(values, 0, 'inner_fire_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'inner_fire_chance_percent_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    18: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_if_no_legendaries');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    19: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    20: {
        masteryRequired: 6,
        override: values => { 
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'hold_duration');
        },
        additionalClassMechanics: [],
        costTypeOverride: SkillCostType.Mana
    },
    21: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'block_stack_on_hit');
        },
        additionalClassMechanics: []
    },
    22: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'recast_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'recast_chance_percent_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    23: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'frenzy_max_stacks');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'frenzy_stack_cooldown_reduction_global_mult');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'frenzy_stack_duration');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'frenzy_stack_per_hit_if_fortunate_of_perfect');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'frenzy_stack_per_hit');
        },
        additionalClassMechanics: []
    },
    24: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'recast_additional_hit');
        },
        additionalClassMechanics: []
    },
    25: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    26: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_pierce_percent_if_fortunate_of_perfect');
        },
        additionalClassMechanics: []
    },
    27: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'mana_on_hit_add');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    28: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'oak_bark_armor_stack_res_phy_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 6, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'oak_bark_armor_max_stack');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_on_hit_if_fortunate_or_perfect');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_on_hit');
        },
        additionalClassMechanics: []
    },
    29: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'additional_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    30: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'astral_retribution_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'astral_retribution_chance_if_perfect');
        },
        additionalClassMechanics: []
    },
    31: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'non_critical_deal_no_damage');
        },
        additionalClassMechanics: []
    },
    32: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_on_splintered_enemy');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    33: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Stat, 'garbage_stat');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'mana_cost_mult');
        },
        additionalClassMechanics: []
    },
    34: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'skill_increased_max_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skill_increased_max_damage_mult');
        },
        additionalClassMechanics: []
    },
    35: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    36: {
        masteryRequired: 5,
        override: values => {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    37: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skewer_on_hit_after_skewered_hit');
        },
        additionalClassMechanics: []
    },
    38: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'explosion_on_wall_hit');
        },
        additionalClassMechanics: []
    },
    39: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 6, false, EffectValueValueType.Upgrade, 'perfect_additional_projectile_add');
        },
        additionalClassMechanics: []
    },
    40: {
        masteryRequired: 9,
        override: values => { 
            setStat(values, 0, 'skill_root_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_root_aoe');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'skill_root_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skill_root_chance_if_perfect');
        },
        additionalClassMechanics: []
    },
    41: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    42: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'mana_cost_reduction_per_bleed');
            addConstant(values, 7, false, EffectValueValueType.Upgrade, 'mana_cost_reduction_per_bleed_distance');
        },
        additionalClassMechanics: []
    },
    43: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'bleed_slow');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    44: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'bleed_increased_damage_mult');
            setSynergyPrecision(values, 0, 0);
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    45: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'block_stack_per_projectile');
        },
        additionalClassMechanics: []
    },
    46: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'destroy_physical_projectiles');
        },
        additionalClassMechanics: []
    },
    47: {
        masteryRequired: 4,
        override: values => { 
            setStat(values, 0, 'quick_silver_max_cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'quick_silver_cooldown_time_reduction_multiplier');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'quick_silver_min_cooldown_time_reduction_multiplier');
        },
        additionalClassMechanics: []
    },
    48: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'bleed_on_hit_add_if_target_full_life');
        },
        additionalClassMechanics: []
    },
    49: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'physical_damage');
        },
        additionalClassMechanics: []
    },
    50: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'fork_chance_percent');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'fork_chance_percent_if_perfect');
        },
        additionalClassMechanics: []
    },
    51: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Duration, 'training_dummy_duration');
        },
        additionalClassMechanics: []
    },
    52: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'overdrive_chance_percent_if_perfect');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'overdrive_apply_bleed');
        },
        additionalClassMechanics: []
    },
    53: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'bleed_on_hit_add');
        },
        additionalClassMechanics: []
    },
    54: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'bleed_transfer_on_death');
        },
        additionalClassMechanics: []
    },
    55: {
        masteryRequired: 9,
        override: values => { 
            setStat(values, 0, 'chance_additional_projectile');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'chance_additional_projectile_add');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_additional_projectile_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    56: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'bleed_on_hit_aoe');
        },
        additionalClassMechanics: []
    },
    57: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skewer_on_hit');
        },
        additionalClassMechanics: []
    },
    58: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'silence_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'silence_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'silence_chance_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    59: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_damage_if_fortunate_or_perfect');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    60: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'military_oppression_enemy_increased_damage'),
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    61: {
        masteryRequired: 2,
        override: values => {
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    62: {
        masteryRequired: 3,
        override: values => {
            values.push(effectValueSynergy(0, 100, EffectValueUpgradeType.UpgradeRank, true, 'enemy_percent_missing_health', 'non_magnified_increased_damage_mult', EffectValueValueType.Upgrade))
        },
        additionalClassMechanics: []
    },
    63: {
        masteryRequired: 4,
        override: values => {
            setSource(values, 0, 'block_stacks');
            setStat(values, 0, 'crit_chance_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    64: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'cadence_cast_count_new_value');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    65: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'magnified_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    66: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'cadence_critically_critical_crit_chance_percent');
            setStat(values, 2, 'cadence_critically_critical_multiplier_if_fortunate');
            setStat(values, 4, 'cadence_critically_critical_multiplier_if_perfect');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    67: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'magnified_count_add_on_other_skill_cast');
        },
        additionalClassMechanics: []
    },
    68: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'chance_to_cast_whirlwind');

            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_cast_whirlwind_on_cast_if_perfect');
        },
        additionalClassMechanics: []
    },
    69: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'blademaster_crit_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    70: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'recast_multiplier_if_perfect');
        },
        additionalClassMechanics: []
    },
    71: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'recast_are_magnified');
        },
        additionalClassMechanics: []
    },
    72: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'astral_beat_max_stacks');
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'astral_beat_astral_retribution_count');
        },
        additionalClassMechanics: []
    },
    73: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'cooldown_time_multiplier_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    74: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'restore_cost_if_no_enemy_hit');
        },
        additionalClassMechanics: []
    },
    75: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'block_stack_per_hit');
        },
        additionalClassMechanics: []
    },
    76: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_range_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    77: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'eagle_punch_chance_per_yard');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'physical_damage');
            setAsUpgrade(values, 1);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'eagle_punch_increased_damage_if_perfect');
        },
        additionalClassMechanics: []
    },
    78: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.AreaOfEffect, 'pull_distance');
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
        },
        additionalClassMechanics: []
    },
    79: {
        masteryRequired: 4,
        override: values =>  { 
            setSource(values, 0, 'weapon_damage');
            setStat(values, 0, 'enemy_under_control_additional_damage');
            setSynergyAllowMinMax(values, 0, false);
            setAsUpgrade(values, 0);
            setSource(values, 1, 'attack_speed');
            setSynergyPrecision(values, 1, 0);
            synergyMultiply100(values, 1);
            setStat(values, 1, 'enemy_under_control_attack_speed');
            setAsUpgrade(values, 0);
            
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'mana_cost_mult_per_enemy_under_control');
        },
        additionalClassMechanics: []
    },
    80: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skill_and_enemy_under_control_increased_damage_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    81: {
        masteryRequired: 6,
        override: values => { 
            setStat(values, 0, 'defense_stack_duration');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Stat, 'melee_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'projectile_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'aoe_defense_stack_reduction');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'defense_max_stack');
        },
        additionalClassMechanics: []
    },
    82: {
        masteryRequired: 7,
        override: values => { 
            setStat(values, 0, 'stun_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'stun_aoe');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'stun_chance_if_fortunate');
        },
        additionalClassMechanics: []
    },
    83: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'elemental_resistance_broken_on_hit');
        },
        additionalClassMechanics: []
    },
    84: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 8, false, EffectValueValueType.Upgrade, 'blind_duration');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'blind_on_hit');
        },
        additionalClassMechanics: []
    },
    85: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'vitality_stack_the_max_health_percent');
            addConstant(values, 7, false, EffectValueValueType.Stat, 'vitality_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'vitality_max_stack');
        },
        additionalClassMechanics: []
    },
    86: {
        masteryRequired: 9,
        override: values => { 
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'earthquake_duration');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'earthquake_aoe');
        },
        additionalClassMechanics: []
    },
    87: {
        masteryRequired: 10,
        override: values =>  { 
            addConstant(values, 1000, false, EffectValueValueType.Flat, 'mana_cost_mult_per_elite_under_control');
        },
        additionalClassMechanics: []
    },
    88: {
        masteryRequired: 2,
        override: values =>  { 
            setStat(values, 0, 'block_stacks_min');
        },
        additionalClassMechanics: []
    },
    89: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'mana_cost_mult');
        },
        additionalClassMechanics: []
    },
    90: {
        masteryRequired: 2,
        override: values =>  {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    91: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'broken_armor_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Flat, 'broken_armor_chance_if_fortunate');
        },
        additionalClassMechanics: []
    },
    92: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'inner_fire_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'inner_fire_chance_percent_if_perfect');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'can_trigger_inner_fire');
        },
        additionalClassMechanics: []
    },
    93: {
        masteryRequired: 4,
        override: values =>  {
            setStat(values, 0, 'slow_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 5, false, EffectValueValueType.Duration, 'slow_duration');
        },
        additionalClassMechanics: []
    },
    94: {
        masteryRequired: 4,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setSource(values, 0, 'block_stacks');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    95: {
        masteryRequired: 5,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'larger_crest_shield_on_cast_if_perfect');
        },
        additionalClassMechanics: []
    },
    96: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_per_second');
        },
        additionalClassMechanics: []
    },
    97: {
        masteryRequired: 6,
        override: values => { 
            setStat(values, 0, 'astral_retribution_on_cast_chance_per_hit');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'astral_retribution_on_cast_chance_if_perfect');
        },
        additionalClassMechanics: []
    },
    98: {
        masteryRequired: 6,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    99: {
        masteryRequired: 7,
        override: values =>  { 
            setStat(values, 0, 'can_aim_to_increase_size');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    100: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'halfway_duplicate_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'halfway_duplicate_chance_if_perfect');
        },
        additionalClassMechanics: []
    },
    101: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'multicast_count_if_perfect');
        },
        additionalClassMechanics: []
    },
    102: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'multicast_count');
            addConstant(values, 40, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
        },
        additionalClassMechanics: []
    },
    103: {
        masteryRequired: 10,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crest_shield_rotate');
        },
        additionalClassMechanics: []
    },
    104: {
        masteryRequired: 2,
        override: values =>  { 
        },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    105: {
        masteryRequired: 2,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    106: {
        masteryRequired: 2,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    107: {
        masteryRequired: 3,
        override: values =>  { 
            addConstant(values, 8, false, EffectValueValueType.Flat, 'skill_hit_per_rotation_required_for_astral_retribution');
        },
        additionalClassMechanics: []
    },
    108: {
        masteryRequired: 3,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    109: {
        masteryRequired: 4,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    110: {
        masteryRequired: 4,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    111: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_arcane_beam_per_rotation_chance');
        },
        additionalClassMechanics: []
    },
    112: {
        masteryRequired: 6,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    113: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, -25, false, EffectValueValueType.Flat, 'skill_elemental_reduction_percent_while_channeling');
        },
        additionalClassMechanics: []
    },
    114: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_dancing_blade_chance');
        },
        additionalClassMechanics: []
    },
    115: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_perfect_arcane_beam_count');
        },
        additionalClassMechanics: []
    },
    116: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 300, false, EffectValueValueType.Flat, 'skill_max_channeling_over_time_damage_bonus');
        },
        additionalClassMechanics: []
    },
    117: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_skewing_max_stack');
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_skewing_stack_conversion');
        },
        additionalClassMechanics: []
    },
    118: {
        masteryRequired: 9,
        override: values =>{ 
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_attraction_aoe');
        },
        additionalClassMechanics: []
    },
    119: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_additional_cooldown');
        },
        additionalClassMechanics: []
    },
    120: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_training_lance_root_duration');
        },
        additionalClassMechanics: []
    },
    121: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_astral_retribution_chance');
        },
        additionalClassMechanics: []
    },
    122: {
        masteryRequired: 2,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    123: {
        masteryRequired: 2,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    124: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_cosmic_stack_astral_retribution_increased_damage');
        },
        additionalClassMechanics: []
    },
    125: {
        masteryRequired: 4,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    126: {
        masteryRequired: 4,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    127: {
        masteryRequired: 5,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    128: {
        masteryRequired: 5,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    129: {
        masteryRequired: 6,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    130: {
        masteryRequired: 7,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    131: {
        masteryRequired: 7,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    132: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_additional_elder_lance');
        },
        additionalClassMechanics: []
    },
    133: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_trap_delay');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_trap_aoe');
        },
        additionalClassMechanics: []
    },
    134: {
        masteryRequired: 9,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    135: {
        masteryRequired: 9,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    136: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_training_lance_additional_pierce_chance_life_treshold');
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_elder_lance_increased_damages_life_treshold');
        },
        additionalClassMechanics: []
    },
    137: {
        masteryRequired: 10,
        override: values => { 
        },
        additionalClassMechanics: []
    },
    138: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'res_phy_percent_per_banner');
        },
        additionalClassMechanics: []
    },
    139: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'skewer_on_hit_if_fortunate');
        },
        additionalClassMechanics: []
    },
    140: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_if_target_is_skewered');
        },
        additionalClassMechanics: []
    },
    141: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'refresh_banner_cooldown_on_kill');
        },
        additionalClassMechanics: []
    },
    142: {
        masteryRequired: 2,
        override: values => {
            synergyMultiply100(values, 0);
        },
        additionalClassMechanics: []
    },
    143: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    144: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_drop_randomly');
        },
        additionalClassMechanics: []
    },
    145: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    146: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_on_critical');
        },
        additionalClassMechanics: []
    },
    147: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'skewer_max_stack_add');
        },
        additionalClassMechanics: []
    },
    148: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_provocation_banner_def_phy');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    149: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_regeneration_buff_mana_on_hit_add');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_knockback_on_land');
        },
        additionalClassMechanics: []
    },
    150: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_sluggishness_daze');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_sluggishness_stun_duration_on_land');
        },
        additionalClassMechanics: []
    },
    151: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Stat, 'banner_haste_block_stack_per_second');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_knockback_on_land');
        },
        additionalClassMechanics: []
    },
    152: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'cooldown_reset_on_block');
        },
        additionalClassMechanics: []
    },
    153: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_fixed_order');
        },
        additionalClassMechanics: []
    },
    154: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skewer_additional_damage_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    155: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'wood_stick_training_lance_stun_chance');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'wood_stick_training_lance_stun_duration');
        },
        additionalClassMechanics: []
    },
    156: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'mighty_swing_cadence_whirlwind_crit_damage_percent');
        },
        additionalClassMechanics: []
    },
    157: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'grappling_hook_crest_shield_cooldown_time_reduction_multiplier');
        },
        additionalClassMechanics: []
    },
    158: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    159: {
        masteryRequired: 7,
        override: values => {            
            addConstant(values, 0, false, EffectValueValueType.Stat, 'garbage_stat');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'reduced_damage_from_melee_percent_if_source_is_full_life');
        },
        additionalClassMechanics: []
    },
    160: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'skewer_as_critical');
        },
        additionalClassMechanics: []
    },
    161: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'increased_damage_if_not_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    162: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'skewer_damage_per_second_percent');
        },
        additionalClassMechanics: []
    },
    163: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    164: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'astral_increased_damage_mult');
        },
        additionalClassMechanics: []
    },
    165: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_per_ennemy_hit');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    166: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'block_chance_is_lucky');
        },
        additionalClassMechanics: []
    },
    167: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'astral_retribution_on_fortunate');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'astral_meteor_on_perfect');
        },
        additionalClassMechanics: [217]
    },
    168: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'stun_chance_add');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'stun_chance_add_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    169: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'pull_distance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    170: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'inner_fire_is_lucky');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'overdrive_is_lucky');
        },
        additionalClassMechanics: []
    },
    171: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'astral_retribution_chance_on_astral_kill');
        },
        additionalClassMechanics: []
    },
    172: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'crest_shield_cast_on_perfect_cast');
        },
        additionalClassMechanics: []
    },
    173: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Stat, 'luck_gained_on_cast');
        },
        additionalClassMechanics: []
    },
    174: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'whirlwind_cast_on_block');
        },
        additionalClassMechanics: []
    },
    175: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ancestral_strike_chance_is_lucky');
        },
        additionalClassMechanics: []
    },
    176: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'inner_fire_crit_chance_percent');
        },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    177: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'overdrive_crit_chance_percent');
        },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.Overdrive]
    },
    178: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'always_max_damage_if_fortunate_or_perfect');
        },
        additionalClassMechanics: []
    },
    179: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'astral_meteor_increased_damage_mult');
        },
        additionalClassMechanics: []
    },
    180: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'purge_on_cast');
        },
        additionalClassMechanics: []
    },
    181: {
        masteryRequired: 7,
        override: values => { 
            setStat(values, 0, 'second_chance_health_restored_percent');
            addConstant(values,3, false, EffectValueValueType.Duration, 'second_chance_cooldown');
        },
        additionalClassMechanics: []
    },
    182: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'astral_meteor_recast_chance');
        },
        additionalClassMechanics: []
    },
    183: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 75, false, EffectValueValueType.Flat, 'chivalry_low_life_reduced_damage');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'chivalry_low_life_treshold');
            setStat(values, 0, 'chivalry_high_life_increased_damage');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'chivalry_high_life_treshold');
        },
        additionalClassMechanics: []
    },
    184: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'astral_retribution_on_cast');
        },
        additionalClassMechanics: [217]
    },
    185: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'perfect_additional_projectile_add');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'recast_chance_percent_if_perfect');
        },
        additionalClassMechanics: []
    },
    186: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'keep_luck_chance');
        },
        additionalClassMechanics: []
    },
    187: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    188: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    189: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'block_stack_on_nullify');
        },
        additionalClassMechanics: []
    },
    190: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'block_stack_per_second');
        },
        additionalClassMechanics: []
    },
    191: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    192: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'skill_duration_add');
            setAsUpgrade(values, 0)
        },
        additionalClassMechanics: []
    },
    193: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'min_block_stacks');
        },
        additionalClassMechanics: []
    },
    194: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    195: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    196: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'cooldown_time_reduction_per_hit_taken');
        },
        additionalClassMechanics: []
    },
    197: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'retaliate_percent_on_blocked_hit');
            setStat(values, 1, 'thorns_percent_on_blocked_hit');
        },
        additionalClassMechanics: []
    },
    198: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'astral_retribution_on_block');
        },
        additionalClassMechanics: []
    },
    199: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'astral_retribution_per_nullified_attack_on_buff_end');
        },
        additionalClassMechanics: []
    },
    200: {
        masteryRequired: 5,
        override: values => {
            setSource(values, 0, 'critical_chance');
            setStat(values, 0, 'retaliate_crit_chance_percent');
            synergyMultiply100(values, 0);
        },
        additionalClassMechanics: []
    },
    201: {
        masteryRequired: 5,
        override: values => {
            setSource(values, 0, 'critical_chance');
            setStat(values, 0, 'thorn_crit_chance_percent');
            synergyMultiply100(values, 0);},
        additionalClassMechanics: []
    },
    202: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'skewer_on_hit_taken');
        },
        additionalClassMechanics: []
    },
    203: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Stat, 'retaliate_dot_duration');
        },
        additionalClassMechanics: []
    },
    204: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'stun_on_block_chance');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'stun_on_block_duration');
        },
        additionalClassMechanics: []
    },
    205: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, -35, false, EffectValueValueType.Stat, 'the_speed_percent');
        },
        additionalClassMechanics: []
    },
    206: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Stat, 'enduring_protector_buff_reduced_damage_from_area_percent');
        },
        additionalClassMechanics: []
    },
    207: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Stat, 'retaliate_add_damages_after_mitigation');
        },
        additionalClassMechanics: []
    },
    208: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'block_damage_reduction');
        },
        additionalClassMechanics: []
    },
    209: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'increased_damage_mult')
        },
        additionalClassMechanics: []
    },
    210: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'add_chest_stats_twice');
        },
        additionalClassMechanics: []
    },
    211: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    212: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_gain_add');
        },
        additionalClassMechanics: []
    },
}

export const DATA_SKILL_1: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
            setStat(values, 0, 'physical_damage');
            addConstant(values, 15, false, EffectValueValueType.Duration, 'skill_duration');
        },
        additionalClassMechanics: [],
        specialization: 214
    },
    1: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'assassin_haste_buff_dodge_global_mult');
        },
        additionalClassMechanics: [],
        specialization: 215
    },
    2: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_increased_damage')
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
        },
        additionalClassMechanics: [],
        specialization: 216
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
            setStat(values, 0, 'physical_damage');
        },
        additionalClassMechanics: []
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
            setStat(values, 0, 'physical_damage');
            addConstant(values, 1.2, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
        },
        additionalClassMechanics: []
    },
    5: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 4);
        },
        additionalClassMechanics: []
    },
    6: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 8);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_radius');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'increased_damage_mult_per_second');
        },
        additionalClassMechanics: []
    },
    7: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 7);
            setStat(values, 1, 'elemental_damage');
            setUpgrade(values, 1, 20);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    8: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 3);
            setStat(values, 1, 'elemental_damage');
            setUpgrade(values, 1, 3);
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'displayed_max_charge');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_pierce_percent_if_fully_charged');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'increased_damage_mult_if_fully_charged');
            addConstant(values, 300, false, EffectValueValueType.Upgrade, 'max_charge');
        },
        additionalClassMechanics: []
    },
    9: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 8);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'climax_increased_damage');
        },
        additionalClassMechanics: []
    },
    10: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setUpgrade(values, 0, 7);
            setStat(values, 1, 'instructions');
            setAsUpgrade(values, 1);
            setValue(values, 1, 2);
            addConstant(values, 1, false, EffectValueValueType.Duration, 'wait_duration');
        },
        additionalClassMechanics: []
    },
    11: {
        masteryRequired: 8,
        override: values => {
            setAsUpgrade(values, 0);
            setUpgrade(values, 0, 100);
            setStat(values, 0, 'increased_damage_mult');
        },
        additionalClassMechanics: []
    },
    12: {
        masteryRequired: 2,
        override: values => { 
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_rebound_chance_percent');
        },
        additionalClassMechanics: []
    },
    13: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_fork_chance_percent');
        },
        additionalClassMechanics: []
    },
    14: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'trap_increased_damage_if_tracked');
        },
        additionalClassMechanics: []
    },
    15: {
        masteryRequired: 4,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'chance_to_pierce_percent');
        },
        additionalClassMechanics: []
    },
    16: {
        masteryRequired: 4,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'fork_count');
        },
        additionalClassMechanics: []
    },
    17: {
        masteryRequired: 5,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'increased_proj_speed_percent_if_tormented');
        },
        additionalClassMechanics: []
    },
    18: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'dodge_global_mult_if_delighted');
        },
        additionalClassMechanics: []
    },
    19: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'increased_damage_per_rebound');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'first_hit_after_rebound_increased_damage');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    20: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'cooldown_time_multiplier');
            setStat(values, 1, 'crit_chance_percent');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    21: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'additional_projectile_add');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    22: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_mana_on_kill_add');
        },
        additionalClassMechanics: []
    },
    23: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'increased_damage_per_pierce');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    24: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'fork_reset_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    25: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'reset_poison_on_hit');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    26: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_per_potential_projectile');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    27: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_cast_if_tormented');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    28: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'travel_time_reduction');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    29: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'aoe_increased_size_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    30: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'armor_broken_on_hit_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    31: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'pull_range_on_cast');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    32: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Stat, 'damage_type_to_elemental');
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    33: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'trap_spawn_on_cast_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    34: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'additional_volleys');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    35: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, -25, false, EffectValueValueType.Flat, 'aoe_increased_size_percent_mult');
            setStat(values, 0, 'additional_volleys');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    36: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'pull_ravenous_dagger_on_hit');
        },
        additionalClassMechanics: []
    },
    37: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'slow_on_hit_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'slow_on_hit_duration');
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    38: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_per_enemy_in_aoe');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    39: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'health_on_kill_add');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    40: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'increased_damage_per_volley_before');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    41: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'delightful_rain_stack_cooldown_reduction_global_mult');
            addConstant(values, 25, false, EffectValueValueType.Flat, 'delightful_rain_max_stacks');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    42: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'next_skill_apply_poison_if_tormented');
        },
        additionalClassMechanics: []
    },
    43: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'ancestral_stab_slash_buff_required_hits');
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'ancestral_stab_slash_buff_brut_chance_percent');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'ancestral_stab_slash_buff_duration');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    44: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setStat(values, 1, 'mana_cost_mult');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    45: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'recast_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    46: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'daze_on_hit_percent');
            addConstant(values, 4, false, EffectValueValueType.Flat, 'daze_on_hit_duration');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    47: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'poison_on_first_hit');
        },
        additionalClassMechanics: []
    },
    48: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    49: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    50: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'elemental_resistance_broken_on_hit');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    51: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    52: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    53: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'overdrive_on_kill');
        },
        additionalClassMechanics: []
    },
    54: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'poison_on_hit_propagation');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    55: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'double_damage_if_double_kill');
        },
        additionalClassMechanics: []
    },
    56: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'poison_health_leech_percent_if_delighted');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    57: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'recast_of_recast_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    58: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'reverse_projectile_speed_effect');
        },
        additionalClassMechanics: []
    },
    59: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'increased_damage_on_elite_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    60: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'mana_on_hit_add');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    61: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_global_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    62: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'auto_aim');
        },
        additionalClassMechanics: []
    },
    63: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'chance_to_pierce_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    64: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'trap_spawn_on_first_hit');
        },
        additionalClassMechanics: []
    },
    65: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'ravenous_dagger_spawn_on_first_hit');
        },
        additionalClassMechanics: []
    },
    66: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'poison_on_hit');
        },
        additionalClassMechanics: []
    },
    67: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'aoe_increased_size_percent_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    68: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    69: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'brut_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    70: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'can_be_recast');
        },
        additionalClassMechanics: []
    },
    71: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'physical_damage');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'homing_bolt_aoe');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: []
    },
    72: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'root_on_hit_duration_if_tormented');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    73: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'silence_on_hit_duration_if_tormented');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    74: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 5, true, EffectValueValueType.Upgrade, 'skill_duration_reduction_if_tormented')
        },
        additionalClassMechanics: []
    },
    75: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'skill_duration_reduction');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    76: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'skill_range_add');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    77: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'blind_on_hit');
        },
        additionalClassMechanics: []
    },
    78: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'mana_regen_add_if_delighted_and_enemy_has_latent_storm');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    79: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'the_speed_percent_per_latent_storm');
            setStat(values, 0, 'the_speed_percent_per_latent_storm_max');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    80: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            addConstant(values, 0.5, false, EffectValueValueType.AreaOfEffect, 'shearing_winds_aoe');
        },
        additionalClassMechanics: []
    },
    81: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skill_spread_if_delighted');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    82: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'skill_duration_add');
        },
        additionalClassMechanics: []
    },
    83: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    84: {
        masteryRequired: 7,
        override: values => {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    85: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'transfer_if_target_die');
        },
        additionalClassMechanics: []
    },
    86: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'physical_damage');
        },
        additionalClassMechanics: []
    },
    87: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 30, false, EffectValueValueType.Upgrade, 'latent_storm_stack_increased_damage');
            setStat(values, 0, 'latent_storm_max_stacks');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    88: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'additional_target');
        },
        additionalClassMechanics: []
    },
    89: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'rebound_chance_percent_if_fully_charged');
        },
        additionalClassMechanics: []
    },
    90: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'chance_to_pierce_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    91: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    92: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'mana_cost_reduction_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    93: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'max_charge');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    94: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, -100, true, EffectValueValueType.Upgrade, 'elemental_damage_mult');
            addConstant(values, 150, true, EffectValueValueType.Upgrade, 'increased_damage_mult');
        },
        additionalClassMechanics: []
    },
    95: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'wormhole_on_hit');
        },
        additionalClassMechanics: []
    },
    96: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'can_trigger_overdrive');
        },
        additionalClassMechanics: []
    },
    97: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'physical_damage');
        },
        additionalClassMechanics: []
    },
    98: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'knockback_projectile_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'reverse_knockback_projectile');
        },
        additionalClassMechanics: []
    },
    99: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'wormhold_absorb_on_kill');
        },
        additionalClassMechanics: []
    },
    100: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'charge_speed_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    101: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'delighted_on_cast');
        },
        additionalClassMechanics: []
    },
    102: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 100, true, EffectValueValueType.Upgrade, 'charge_speed_mult_if_tormented');
        },
        additionalClassMechanics: []
    },
    103: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    104: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_damage_mult_per_target_left_health_percent');
        },
        additionalClassMechanics: []
    },
    105: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_damage_mult_per_target_missing_health_percent');
        },
        additionalClassMechanics: []
    },
    106: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_range');
        },
        additionalClassMechanics: []
    },
    107: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'cost_and_cooldown');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'mana_cost_mult_if_tormented');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'cooldown_time_multiplier_if_tormented');
        },
        additionalClassMechanics: []
    },
    108: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cooldown_reset_on_climax');
        },
        additionalClassMechanics: []
    },
    109: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_percent_on_critical_strike');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    110: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'move_to_climax');
        },
        additionalClassMechanics: []
    },
    111: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'climax_crit_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, -50, false, EffectValueValueType.Upgrade, 'climax_increased_damage_add');
        },
        additionalClassMechanics: []
    },
    112: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'blind_duration');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'blind_on_climax_aoe');
        },
        additionalClassMechanics: []
    },
    113: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'poison_on_climax_and_delighted');
        },
        additionalClassMechanics: []
    },
    114: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'spawn_trap_on_climax_and_tormented');
        },
        additionalClassMechanics: []
    },
    115: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Flat, 'overdrive_count_mult')
        },
        additionalClassMechanics: []
    },
    116: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'ravenous_dagger_explosion_on_climax');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    117: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'opposite_finesse_increased_damages');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    118: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 4, false, EffectValueValueType.AreaOfEffect, 'wandering_arrow_range');
        },
        additionalClassMechanics: []
    },
    119: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'travel_back_additional_damage_per_remaining_instructions');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    120: {
        masteryRequired: 2,
        override: values => {{
            setStat(values, 0, 'instructions_add');
            setAsUpgrade(values, 0);
        }},
        additionalClassMechanics: []
    },
    121: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'mana_regen_add_per_hit');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    122: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'brut_chance_percent_per_yard_with_immortal_arrow');
        },
        additionalClassMechanics: []
    },
    123: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'inner_fire_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'can_trigger_inner_fire');
        },
        additionalClassMechanics: []
    },
    124: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    125: {
        masteryRequired: 5,
        override: values => {
            values.push(effectValueSynergy(0, 100, EffectValueUpgradeType.UpgradeRank, true, 'additional_projectile', 'additional_instructions', EffectValueValueType.Upgrade))
        },
        additionalClassMechanics: []
    },
    126: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'serenity_per_hit');
        },
        additionalClassMechanics: []
    },
    127: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crit_damage_percent_per_instruction');
        },
        additionalClassMechanics: []
    },
    128: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'stun_duration');
        },
        additionalClassMechanics: []
    },
    129: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crit_chance_percent_per_traveled_yard');
        },
        additionalClassMechanics: []
    },
    130: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'exhilerating_senses_stack_cooldown_reduction_global_mult');
        },
        additionalClassMechanics: []
    },
    131: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    132: {
        masteryRequired: 10,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 1, 'physical_damage');
            setAsUpgrade(values, 1);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'impatient_arrow_stack_per_second');
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'impatient_arrow_stack_shockwave_chance');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'impatient_arrow_shockwave_aoe');
        },
        additionalClassMechanics: []
    },
    133: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    134: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    135: {
        masteryRequired: 1,
        override: values => {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: []
    },
    136: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    137: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    138: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'light_arrow_increased_damage')
        },
        additionalClassMechanics: []
    },
    139: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_deafult_serenity_drop');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_serenity_drop');
        },
        additionalClassMechanics: []
    },
    140: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_apply_poison');
        },
        additionalClassMechanics: []
    },
    141: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'the_max_health_percent_per_totem');
        },
        additionalClassMechanics: []
    },
    142: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_enemies')
        },
        additionalClassMechanics: []
    },
    143: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'turret_syndrome_spawn_chance_on_kill');
        },
        additionalClassMechanics: []
    },
    144: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    145: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'trap_arm_arm_time_percent');
        },
        additionalClassMechanics: []
    },
    146: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_show_rain_of_arrow_void_arrow_immortal_arrow_apply_poison');
        },
        additionalClassMechanics: []
    },
    147: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_increased_damage_percent');
        },
        additionalClassMechanics: []
    },
    148: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'light_arrow_chance_to_pierce_percent');
        },
        additionalClassMechanics: []
    },
    149: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_additional_rearm');
        },
        additionalClassMechanics: []
    },
    150: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    151: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'light_arrow_shared_projectile_modifiers_aoe');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'light_arrow_shared_projectile_modifiers');
        },
        additionalClassMechanics: []
    },
    152: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'turret_syndrome_reduced_cooldown_per_serenity');
            
        },
        additionalClassMechanics: []
    },
    153: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    154: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'turret_syndrome_on_cooldown_dodge_percent')
        },
        additionalClassMechanics: []
    },
    155: {
        masteryRequired: 7,
        override: values => { 
            setStat(values, 0, 'life_on_hit_if_tormented')
            
        },
        additionalClassMechanics: []
    },
    156: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    157: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    158: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'isolated_target_increased_damage');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'isolated_target_distance');
        },
        additionalClassMechanics: []
    },
    159: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'assassin_haste_buff_movement_speed');
        },
        additionalClassMechanics: []
    },
    160: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'negative_effect_target_increased_damage');
        },
        additionalClassMechanics: []
    },
    161: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'close_target_increased_damage');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'close_target_radius');
        },
        additionalClassMechanics: []
    },
    162: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    163: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'tumble_cooldown_reset_chance_on_cast');
        },
        additionalClassMechanics: []
    },
    164: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'self_control_cooldown_reduction_global_mult');
            addConstant(values, 8, false, EffectValueValueType.Duration, 'self_control_disabled_duration');
        },
        additionalClassMechanics: []
    },
    165: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'poisoned_enemy_increased_damage');
            
        },
        additionalClassMechanics: []
    },
    166: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, -100, false, EffectValueValueType.Stat, 'last_cast_tormented_increased_cost');
        },
        additionalClassMechanics: []
    },
    167: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'last_cast_tormented_crit_chance_percent');
        },
        additionalClassMechanics: []
    },
    168: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    169: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_tumble_cast');
        },
        additionalClassMechanics: []
    },
    170: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_tumble_cast');
        },
        additionalClassMechanics: []
    },
    171: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    172: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    173: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_on_tumble_cast');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_on_tumble_land');
        },
        additionalClassMechanics: []
    },
    174: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    175: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    176: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_on_tumble_land');
        },
        additionalClassMechanics: []
    },
    177: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_void_arrow_immortal_arrow_repeal_non_elemental_projectile');
        },
        additionalClassMechanics: []
    },
    178: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'tormented_movement_speed');
        },
        additionalClassMechanics: []
    },
    179: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    180: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'critical_strike_chance_is_lucky');
        },
        additionalClassMechanics: []
    },
    181: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 1, 'tormented_additional_projectile_add');
            setStat(values, 2, 'arrow_shot_void_arrow_heavy_explosive_increased_mana_cost');
        },
        additionalClassMechanics: []
    },
    182: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    183: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    184: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_crit_chance_percent');
        },
        additionalClassMechanics: []
    },
    185: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_serenity_increase_default');
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_serenity_increase_total');
        },
        additionalClassMechanics: []
    },
    186: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Flat, 'idle_armor_penetration_percent');
        },
        additionalClassMechanics: []
    },
    187: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    188: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'skill_duration_add');
        },
        additionalClassMechanics: []
    },
    189: {
        masteryRequired: 3,
        override: values => {
            setAsUpgrade(values, 1);
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trigger_all_ravenous_dagger_at_once');
        },
        additionalClassMechanics: []
    },
    190: {
        masteryRequired: 3,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'ravenous_dagger_explosions_on_trigger');
        },
        additionalClassMechanics: []
    },
    191: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'smoke_screen_buff_ignore_incoming_attacks');
        },
        additionalClassMechanics: []
    },
    192: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    193: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'gold_drop_on_critical_strike');
        },
        additionalClassMechanics: []
    },
    194: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_mana_regen_global_mult');
        },
        additionalClassMechanics: []
    },
    195: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_cast');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_buff_end');
        },
        additionalClassMechanics: []
    },
    196: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_tormented');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_delighted');
        },
        additionalClassMechanics: []
    },
    197: {
        masteryRequired: 5,
        override: values => { 
            setStat(values, 0, 'poison_increased_damage_per_poisoned_enemy');
            addConstant(values, 5, false, EffectValueValueType.AreaOfEffect, 'poison_increased_damage_per_poisoned_enemy_range');
        },
        additionalClassMechanics: []
    },
    198: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'movement_speed_after_trap_triggered');
        },
        additionalClassMechanics: []
    },
    199: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_evade');
        },
        additionalClassMechanics: []
    },
    200: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    201: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 1.5, false, EffectValueValueType.Upgrade, 'smoke_screen_stun_aoe_on_cast_range');
            setAsUpgrade(values, 0);
            setStat(values, 0, 'smoke_screen_stun_aoe_on_cast_duration');
        },
        additionalClassMechanics: []
    },
    202: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'inner_fire_apply_poison');
        },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    203: {
        masteryRequired: 7,
        override: values => {
        },
        additionalClassMechanics: []
    },
    204: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'poison_increased_damage');
        },
        additionalClassMechanics: []
    },
    205: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'poison_remaining_damage_on_reapply');
        },
        additionalClassMechanics: []
    },
    206: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_on_smoke_screen_end');
        },
        additionalClassMechanics: []
    },
}

export const DATA_SKILL_2: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 40, false, EffectValueValueType.Flat, 'skill_2_0_slow_percent');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'skill_2_0_slow_duration');
            addConstant(values, -90, false, EffectValueValueType.Flat, 'skill_2_0_projectile_slow');
        },
        additionalClassMechanics: [],
        specialization: 220
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 2);
        },
        additionalClassMechanics: [],
        specialization: 221
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
            setUpgrade(values, 1, 4);
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_2_4_tick_per_second');
        },
        additionalClassMechanics: [],
        specialization: 222
    },
    5: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 15);
        },
        additionalClassMechanics: []
    },
    6: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
            setUpgrade(values, 1, 8);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_2_6_aoe');
        },
        additionalClassMechanics: []
    },
    7: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 5000, false, EffectValueValueType.Flat, 'skill_2_7_remnant_increased_damages');
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_2_7_remnant_base_damages');
        },
        additionalClassMechanics: []
    },
    8: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
            setUpgrade(values, 1, 2);
        },
        additionalClassMechanics: []
    },
    9: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_2_9_duration');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_2_9_aoe');
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_2_9_tick_per_second');
        },
        additionalClassMechanics: []
    },
    10: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 5);
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_2_10_pierce_chance');
        },
        additionalClassMechanics: []
    },
    11: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    12: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    13: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    14: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    15: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    16: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    17: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    18: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    19: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    20: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_remnant_count');
        },
        additionalClassMechanics: []
    },
    21: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    22: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    23: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    24: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    25: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    26: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    27: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    28: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    29: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    30: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    31: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    32: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    33: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    34: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_channeling_duration_before_knockback');
        },
        additionalClassMechanics: []
    },
    35: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 15, false, EffectValueValueType.Flat, 'skill_slow_per_stack');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_slow_duration');
        },
        additionalClassMechanics: []
    },
    36: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    37: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    38: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_side_ray_damages_percent');
        },
        additionalClassMechanics: []
    },
    39: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_max_grow');
        },
        additionalClassMechanics: []
    },
    40: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    41: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_full_strength_last_emblems_count');
        },
        additionalClassMechanics: []
    },
    42: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    43: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    44: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    45: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    46: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
        },
        additionalClassMechanics: []
    },
    47: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    48: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    49: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    50: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    51: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    52: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    53: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    54: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    55: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    56: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    57: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    58: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_emblem_per_cast_count');
        },
        additionalClassMechanics: []
    },
    59: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    60: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    61: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    62: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_charge_max_time');
        },
        additionalClassMechanics: []
    },
    63: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    64: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Duration, 'skill_high_spirit_stack_duration');
        },
        additionalClassMechanics: []
    },
    65: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    66: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    67: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    68: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    69: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    70: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    71: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_burst_delay');
        },
        additionalClassMechanics: []
    },
    72: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    73: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    74: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    75: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    76: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    77: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    78: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_chrono_metamorphosis_stack_max_mana_percent');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_chrono_metamorphosis_stack_duration');
        },
        additionalClassMechanics: []
    },
    79: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_chrono_armor_stack_max_armor_percent');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_chrono_armor_stack_duration');
        },
        additionalClassMechanics: []
    },
    80: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_chrono_empower_stack_duration');
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_chrono_empower_stack_next_other_school_skill_increased_damage_percent');
        },
        additionalClassMechanics: []
    },
    81: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_chrono_speed_stack_attack_speed');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_chrono_speed_stack_duration');},
        additionalClassMechanics: []
    },
    82: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    83: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    84: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    85: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    86: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    87: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    88: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 0.5, false, EffectValueValueType.AreaOfEffect, 'skill_chrono_burst_aoe');
        },
        additionalClassMechanics: []
    },
    89: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    90: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    91: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    92: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    93: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    94: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    95: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    96: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    97: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    98: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_increased_clone_breach_duration_on_hit');
        },
        additionalClassMechanics: []
    },
    99: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    100: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    101: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    102: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_multicast_count_around_if_last_3_emblems_diffent');
        },
        additionalClassMechanics: []
    },
    103: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    104: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    105: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    106: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_charge_duration');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_fully_charged_multicast_row_count');
        },
        additionalClassMechanics: []
    },
    107: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 70, false, EffectValueValueType.Flat, 'skill_size_reduction');
        },
        additionalClassMechanics: []
    },
    108: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    109: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    110: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    111: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_increased_mana_cost_per_arcanic_emblem');
        },
        additionalClassMechanics: []
    },
    112: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    113: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    114: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_delay_spawn');
        },
        additionalClassMechanics: []
    },
    115: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    116: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    117: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    118: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_arcane_flux_increased_attack_speed');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_arcane_flux_duration');
        },
        additionalClassMechanics: []
    },
    119: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
        },
        additionalClassMechanics: []
    },
    120: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_collision_max_stack');
        },
        additionalClassMechanics: []
    },
    121: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    122: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_arcane_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    123: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    124: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    125: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    126: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_bounce_remnant_cast_count');
        },
        additionalClassMechanics: []
    },
    127: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 30, false, EffectValueValueType.Flat, 'skill_decreased_damages');
        },
        additionalClassMechanics: []
    },
    128: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    129: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    130: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    131: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    132: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    133: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    134: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    135: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_temporal_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    136: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.AreaOfEffect, 'skill_reduced_damages');
        },
        additionalClassMechanics: []
    },
    137: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    138: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    139: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 0.5, false, EffectValueValueType.Duration, 'skill_time_between_remnants');
        },
        additionalClassMechanics: []
    },
    140: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_increased_cooldown');
        },
        additionalClassMechanics: []
    },
    141: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    142: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    143: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    144: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_movement_speed_buff_duration');
        },
        additionalClassMechanics: []
    },
    145: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_arcane_bond_buff_range');
        },
        additionalClassMechanics: [216]
    },
    146: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    147: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    148: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    149: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    150: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    151: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    152: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    153: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    154: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Duration, 'skill_elemental_damage_buff_duration');
        },
        additionalClassMechanics: []
    },
    155: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_diffent_last_emblems_for_arcane_bond_on_hit');
        },
        additionalClassMechanics: []
    },
    156: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    157: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 20, false, EffectValueValueType.Flat, 'skill_remnant_rift_nova_cast_life_treshold');
        },
        additionalClassMechanics: []
    },
    158: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    159: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    160: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    161: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    162: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: [217]
    },
    163: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Flat, 'max_emblems');
        },
        additionalClassMechanics: [214]
    },
    164: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    165: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    166: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    167: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    168: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    169: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    170: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    171: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_swap_delay');
        },
        additionalClassMechanics: []
    },
    172: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    173: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    174: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    175: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    176: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_mana_resonance_aoe');
        },
        additionalClassMechanics: []
    },
    177: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_cooldown_reset_life_lost_treshold');
        },
        additionalClassMechanics: []
    },
    178: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_temporal_clone_delay_explosion');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_temporal_clone_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    179: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    180: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    181: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    182: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_recast_duration');
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_additional_cooldown_per_recast');
        },
        additionalClassMechanics: []
    },
    183: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Flat, 'max_emblems');
        },
        additionalClassMechanics: [214]
    },
    184: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    185: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    186: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    187: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    188: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_remnant_cloud_max_grow');
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_remnant_cloud_explosion_delay');
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_remnant_cloud_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    189: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    190: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    191: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    192: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    193: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    194: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    195: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_silence_duration');
        },
        additionalClassMechanics: []
    },
    196: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    197: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    198: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    199: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    200: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    201: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_arcane_barius_catch_radius');
        },
        additionalClassMechanics: []
    },
    202: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    203: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    204: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: [218]
    },
    205: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'additional_arcane_clone');
        },
        additionalClassMechanics: []
    },
    206: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    207: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    208: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    209: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'additional_arcane_clone');
        },
        additionalClassMechanics: []
    },
    210: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    211: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    223: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
}

export const DATA_SKILL: GameHeroesData<{ [key: number]: DataSkill }> = {
    0: DATA_SKILL_0,
    1: DATA_SKILL_1,
    2: DATA_SKILL_2
}