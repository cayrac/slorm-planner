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
import { SkillGenre } from '../../../model/content/enum/skill-genre';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable, warnIfEqual } from '../../../util/utils';

function setUpgrade(values: Array<AbstractEffectValue>, index: number, upgrade: number) {
    const value = <EffectValueVariable | EffectValueSynergy>values[index];

    if (value && typeof value.upgrade === 'number') {
        warnIfEqual(value.upgrade, upgrade, 'skill setUpgrade at index ' + index + ' did not changed anthing', values);
        value.upgrade = upgrade;
    } else {
        throw new Error('failed to update upgrade at index ' + index);
    }
}

function setValue(values: Array<AbstractEffectValue>, index: number, newValue: number) {
    const value = <EffectValueVariable | EffectValueConstant>values[index];

    if (value && typeof value.value === 'number') {
        warnIfEqual(value.value, newValue, 'skill setValue at index ' + index + ' did not changed anthing', values);
        value.value = newValue;
        warnIfEqual(value.baseValue, newValue, 'skill setValue at index ' + index + ' did not changed anthing', values);
        value.baseValue = newValue;
    } else {
        throw new Error('failed to update value at index ' + index);
    }
}

function setStat(values: Array<AbstractEffectValue>, index: number, stat: string) {
    const value = <EffectValueVariable | EffectValueConstant | EffectValueSynergy>values[index];

    if (value) {
        warnIfEqual(value.stat, stat, 'skill setStat at index ' + index + ' did not changed anthing', values);
        value.stat = stat;
    } else {
        throw new Error('failed to update stat at index ' + index);
    }
}

function setSynergyPrecision(values: Array<AbstractEffectValue>, index: number, precision: number) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        warnIfEqual(value.precision, precision, 'skill setSynergyPrecision at index ' + index + ' did not changed anthing', values);
        value.precision = precision;
    } else {
        throw new Error('failed to update precision at index ' + index);
    }
}

function setSynergyAllowMinMax(values: Array<AbstractEffectValue>, index: number, allowMinMax: boolean) {
    const value = values[index];

    if (value && isEffectValueSynergy(value)) {
        warnIfEqual(value.allowMinMax, allowMinMax, 'skill setSynergyAllowMinMax at index ' + index + ' did not changed anthing', values);
        value.allowMinMax = allowMinMax;
    } else {
        throw new Error('failed to update allowMinMax at index ' + index);
    }
}

function setSource(values: Array<AbstractEffectValue>, index: number, source: string) {
    const value = <AbstractEffectValue>values[index];

    if (isEffectValueSynergy(value)) {
        warnIfEqual(value.source, source, 'skill setSource at index ' + index + ' did not changed anthing', values);
        value.source = source;
    } else {
        throw new Error('failed to update source at index ' + index);
    }
}

function setAsUpgrade(values: Array<AbstractEffectValue>, index: number) {
    setValueType(values, index, EffectValueValueType.Upgrade);
}

function setValueType(values: Array<AbstractEffectValue>, index: number, valueType: EffectValueValueType) {
    const value = <EffectValueVariable | EffectValueConstant>values[index];

    if (value) {
        warnIfEqual(value.valueType, valueType, 'skill setValueType at index ' + index + ' did not changed anthing', values);
        value.valueType = valueType;
    } else {
        throw new Error('failed to set an effect value type at index ' + index);
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

function variableToSynergy(values: Array<AbstractEffectValue>, index: number, source: string, stat: string, precision: number | null = null, allowMinMax: boolean = true) {
    const value = values[index];

    if (value && isEffectValueVariable(value)) {
        values.splice(index, 1, effectValueSynergy(value.baseValue, value.upgrade, value.upgradeType, value.percent, source, stat, value.valueType, undefined, precision, allowMinMax));
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}

function setSynergyShowValue(values: Array<AbstractEffectValue>, index: number, showValue: boolean) {
    const value = values[index]

    if (value && isEffectValueSynergy(value)) {
        value.showValue = showValue;
    } else {
        throw new Error('failed to change synergy showValue at index ' + index);
    }
}

function allowSynergyToCascade(values: Array<AbstractEffectValue>, index: number) {
    const value = values[index]

    if (value && isEffectValueSynergy(value)) {
        value.cascadeSynergy = true;
    } else {
        throw new Error('failed to change synergy cascade at index ' + index);
    }
}

export const DATA_SKILL_0: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_duration');
            addConstant(values, 2.5, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setSynergyShowValue(values, 0, false);
            setAsUpgrade(values, 0);
            setStat(values, 1, 'banner_provocation_banner_max_health');
            setAsUpgrade(values, 1);
            setStat(values, 2, 'banner_regeneration_buff_health_on_hit_add');
            setStat(values, 3, 'banner_haste_buff_attack_speed_global_mult');
            setStat(values, 4, 'banner_sluggishness_slow');
            setAsUpgrade(values, 4);
        },
        specialization: 219
    },
    1: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
        },
        specialization: 220
    },
    2: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 2);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
        },
        specialization: 221
    },
    3: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
        }
    },
    4: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 6);
        }
    },
    5: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 2);
            setSource(values, 1, 'physical_damage');
            setStat(values, 1, 'bleed_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 14);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'swords_projectile_count');
            addConstant(values, 7, false, EffectValueValueType.Duration, 'bleed_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'bleed_max_stacks');
        }
    },
    6: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 1, 7);
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'cadence_cast_count');
        }
    },
    7: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 6);
        }
    },
    8: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
        }
    },
    9: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 2);
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'garbage_stat');
        }
    },
    10: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 1, 17);
            setStat(values, 1, 'physical_damage');
            allowSynergyToCascade(values, 1);
        }
    },
    11: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    12: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'daze_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'daze_duration');
        }
    },
    13: {
        masteryRequired: 4, // TODO constante qui manque skewering swing
        order: 22,
        override: values => { 
            setStat(values, 0, 'skewer_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skewer_chance_if_perfect');
        },
        additionalClassMechanics: [ 215, 216 ]
    },
    14: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'additional_damage_add');
            setAsUpgrade(values, 0);
        }
    },
    15: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'health_leech_percent_if_perfect')
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [215]
    },
    16: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'overdrive_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'overdrive_chance_percent_if_fortunate_or_perfect');
        },
        additionalMechanics: [MechanicType.Overdrive],
        additionalClassMechanics: [215]
    },
    17: {
        masteryRequired: 2,
        override: values => { 
            setStat(values, 0, 'inner_fire_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'inner_fire_chance_percent_if_fortunate_or_perfect');
        },
        additionalMechanics: [MechanicType.InnerFire],
        additionalClassMechanics: [215]
    },
    18: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_if_no_legendaries');
            setAsUpgrade(values, 0);
        }
    },
    19: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    20: {
        masteryRequired: 6,
        override: values => { 
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'hold_duration');
        },
        costTypeOverride: SkillCostType.Mana
    },
    21: {
        masteryRequired: 3,
        order: 14,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'block_stack_on_hit');
        },
        additionalClassMechanics: [ 218 ]
    },
    22: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'recast_chance_percent')
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'recast_chance_percent_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    23: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'frenzy_max_stacks');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'frenzy_stack_attack_speed_global_mult');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'frenzy_stack_duration');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'frenzy_stack_per_hit_if_fortunate_of_perfect');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'frenzy_stack_per_hit');
        },
        additionalClassMechanics: [215]
    },
    24: {
        masteryRequired: 9,
        override: values => {
            setValue(values, 0, 100);
            setSource(values, 0, 'recast_chance');
            setAsUpgrade(values, 0);
        }
    },
    25: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setAsUpgrade(values, 0);
            setSource(values, 1, 'weapon_damage');
            setSynergyAllowMinMax(values, 1, false);
            setAsUpgrade(values, 1);
        }
    },
    26: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_pierce_percent_if_fortunate_of_perfect');
        },
        additionalClassMechanics: [215]
    },
    27: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
        }
    },
    28: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'oak_bark_armor_stack_res_phy_percent');
            addConstant(values, 6, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'oak_bark_armor_max_stack');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_on_hit_if_fortunate_or_perfect');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'oak_bark_armor_stack_on_hit');
        },
        additionalClassMechanics: [215]
    },
    29: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'additional_damage_add');
            setAsUpgrade(values, 0);
        }
    },
    30: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'astral_retribution_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'astral_retribution_chance_if_perfect');
        },
        additionalClassMechanics: [ 215, 217 ]
    },
    31: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'non_critical_damage');
        },
        additionalClassMechanics: [215]
    },
    32: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_on_splintered_enemy');
            setAsUpgrade(values, 0);
        }
    },
    33: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Stat, 'garbage_stat');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'mana_cost_mult');
        }
    },
    34: {
        masteryRequired: 8,
        override: values => { 
            setStat(values, 0, 'skill_increased_max_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skill_increased_max_damage_mult');
        },
        additionalClassMechanics: [215]
    },
    35: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        }
    },
    36: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    37: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skewer_on_hit_after_skewered_hit');
        },
        additionalClassMechanics: [ 216 ]
    },
    38: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'explosion_on_wall_hit');
        }
    },
    39: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 6, false, EffectValueValueType.Upgrade, 'perfect_additional_projectile_add');
        },
        additionalClassMechanics: [215]
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
        additionalClassMechanics: [215]
    },
    41: {
        masteryRequired: 10,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    42: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cost_reduction_skill_per_bleed');
            addConstant(values, 7, false, EffectValueValueType.Upgrade, 'cost_reduction_skill_per_bleed_distance');
            addConstant(values, 15, false, EffectValueValueType.Upgrade, 'max_projectiles_per_bleed');
            addConstant(values, 7, false, EffectValueValueType.Upgrade, 'max_projectiles_per_bleed_distance');
        }
    },
    43: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'bleed_slow');
            setAsUpgrade(values, 0);
        }
    },
    44: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'bleed_increased_damage_mult');
            setSynergyPrecision(values, 0, 0);
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    45: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'block_stack_per_projectile');
        },
        additionalClassMechanics: [ 218 ]
    },
    46: {
        masteryRequired: 3,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'destroy_physical_projectiles');
        }
    },
    47: {
        masteryRequired: 3,
        line: 2,
        override: values => { 
            setStat(values, 0, 'quick_silver_max_cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'quick_silver_cooldown_time_reduction_multiplier');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'quick_silver_min_cooldown_time_reduction_multiplier');
        }
    },
    48: {
        masteryRequired: 4,
        line: 3,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'bleed_on_hit_add_if_target_full_life');
        }
    },
    49: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'physical_damage');
        }
    },
    50: {
        masteryRequired: 5,
        line: 3,
        override: values => {
            setStat(values, 0, 'fork_chance_percent');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'fork_chance_percent_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    51: {
        masteryRequired: 6,
        line: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Duration, 'training_dummy_duration');
        },
        additionalClassMechanics: [215]
    },
    52: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'overdrive_chance_percent_if_perfect');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'overdrive_apply_bleed');
        },
        additionalMechanics: [MechanicType.Overdrive],
        additionalClassMechanics: [215]
    },
    53: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'bleed_on_hit_add');
        }
    },
    54: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'bleed_transfer_on_death');
        }
    },
    55: {
        masteryRequired: 8,
        line: 5,
        override: values => { 
            setStat(values, 0, 'chance_additional_projectile');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'chance_additional_projectile_add');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_additional_projectile_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    56: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'bleed_on_hit_aoe');
        }
    },
    57: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skewer_on_hit');
        },
        additionalClassMechanics: [ 216 ]
    },
    58: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'silence_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'silence_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'silence_chance_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    59: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_if_fortunate_or_perfect');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [215]
    },
    60: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'military_oppression_enemy_increased_damage'),
            setAsUpgrade(values, 0);
        }
    },
    61: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult'),
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    62: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            values.push(effectValueSynergy(0, 100, EffectValueUpgradeType.UpgradeRank, true, 'enemy_percent_missing_health', 'non_magnified_increased_damage_mult', EffectValueValueType.Upgrade))
        }
    },
    63: {
        masteryRequired: 3,
        override: values => {
            setSource(values, 0, 'block_stacks');
            setStat(values, 0, 'crit_chance_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 218 ]
    },
    64: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'cadence_cast_count_new_value');
            setAsUpgrade(values, 0);
        }
    },
    65: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'magnified_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    66: {
        masteryRequired: 5,
        line: 3,
        override: values => {
            setStat(values, 0, 'cadence_critically_critical_crit_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Stat, 'cadence_critically_critical_multiplier_if_fortunate');
            addConstant(values, 4, false, EffectValueValueType.Stat, 'cadence_critically_critical_multiplier_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    67: {
        masteryRequired: 6,
        line: 4,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'magnified_count_add_on_other_skill_cast');
        }
    },
    68: {
        masteryRequired: 7,
        line: 4,
        override: values => { 
            setStat(values, 0, 'chance_to_cast_whirlwind');

            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_cast_whirlwind_on_cast_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    69: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            setStat(values, 0, 'blademaster_crit_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    70: {
        masteryRequired: 8,
        line: 5,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'recast_multiplier_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    71: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'recast_are_magnified');
        }
    },
    72: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'astral_beat_max_stacks');
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'astral_beat_astral_retribution_count');
        },
        additionalClassMechanics: [ 217 ]
    },
    73: {
        masteryRequired: 1,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'cooldown_time_multiplier_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    74: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'restore_cost_if_no_enemy_hit');
        }
    },
    75: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'block_stack_per_hit');
        },
        additionalClassMechanics: [ 218 ]
    },
    76: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_range_percent');
            setAsUpgrade(values, 0);
        }
    },
    77: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'eagle_punch_chance_per_yard');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'physical_damage');
            setAsUpgrade(values, 1);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'eagle_punch_increased_damage_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    78: {
        masteryRequired: 2,
        line: 2,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.AreaOfEffect, 'pull_distance');
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
        }
    },
    79: {
        masteryRequired: 2,
        line: 2,
        override: values =>  { 
            setStat(values, 0, 'enemy_under_control_additional_damage');
            setSynergyAllowMinMax(values, 0, false);
            setAsUpgrade(values, 0);
            setSynergyPrecision(values, 1, 0);
            synergyMultiply100(values, 1);
            setStat(values, 1, 'enemy_under_control_attack_speed');
            
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'cost_mult_skill_per_enemy_under_control');
        }
    },
    80: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'skill_and_enemy_under_control_increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    81: {
        masteryRequired: 4,
        line: 3,
        override: values => { 
            setStat(values, 0, 'defense_stack_duration');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Stat, 'melee_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'projectile_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'aoe_defense_stack_reduction');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'defense_max_stack');
        }
    },
    82: {
        masteryRequired: 5,
        line: 4,
        override: values => { 
            setStat(values, 0, 'stun_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'stun_aoe');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'stun_chance_if_fortunate');
        },
        additionalClassMechanics: [215]
    },
    83: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'elemental_resistance_broken_on_hit');
        }
    },
    84: {
        masteryRequired: 6,
        line: 4,
        override: values => { 
            addConstant(values, 8, false, EffectValueValueType.Upgrade, 'blind_duration');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'blind_on_hit');
        }
    },
    85: {
        masteryRequired: 6,
        line: 4,
        override: values => { 
            setStat(values, 0, 'vitality_stack_the_max_health_percent');
            addConstant(values, 7, false, EffectValueValueType.Stat, 'vitality_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'vitality_max_stack');
        }
    },
    86: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'earthquake_duration');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'earthquake_aoe');
        },
        additionalClassMechanics: [215]
    },
    87: {
        masteryRequired: 8,
        line: 5,
        override: values =>  { 
            addConstant(values, 1000, false, EffectValueValueType.Flat, 'mana_cost_mult_per_elite_under_control');
        }
    },
    88: {
        masteryRequired: 1,
        override: values =>  { 
            setStat(values, 0, 'block_stacks_min');
        },
        additionalClassMechanics: [ 218 ]
    },
    89: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'mana_cost_mult_skill');
        }
    },
    90: {
        masteryRequired: 1,
        override: values =>  {
            setAsUpgrade(values, 0);
        }
    },
    91: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'broken_armor_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Flat, 'broken_armor_chance_if_fortunate');
        },
        additionalClassMechanics: [215]
    },
    92: {
        masteryRequired: 1,
        line: 2,
        override: values => { 
            setStat(values, 0, 'inner_fire_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'inner_fire_chance_percent_if_perfect');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'can_trigger_inner_fire');
        },
        additionalMechanics: [MechanicType.InnerFire],
        additionalClassMechanics: [215]
    },
    93: {
        masteryRequired: 2,
        line: 2,
        override: values =>  {
            setStat(values, 0, 'slow_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 5, false, EffectValueValueType.Duration, 'slow_duration');
        }
    },
    94: {
        masteryRequired: 2,
        line: 2,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setSource(values, 0, 'block_stacks');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 218 ]
    },
    95: {
        masteryRequired: 3,
        line: 3,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'larger_crest_shield_on_cast_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    96: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_per_second');
        },
        additionalClassMechanics: [ 217, 218 ]
    },
    97: {
        masteryRequired: 4,
        line: 3,
        override: values => { 
            setStat(values, 0, 'astral_retribution_on_cast_chance_per_hit');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'astral_retribution_on_cast_chance_if_perfect');
        },
        additionalClassMechanics: [ 215, 217 ]
    },
    98: {
        masteryRequired: 4,
        line: 3,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'garbage_stat');
        }
    },
    99: {
        masteryRequired: 5,
        line: 4,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'can_aim_to_increase_size');
        }
    },
    100: {
        masteryRequired: 6,
        line: 4,
        override: values => { 
            setStat(values, 0, 'halfway_duplicate_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'halfway_duplicate_chance_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    101: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'multicast_count_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    102: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'multicast_count');
            addConstant(values, 40, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
        }
    },
    103: {
        masteryRequired: 8,
        line: 5,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crest_shield_rotate');
        }
    },
    104: {
        masteryRequired: 1,
        override: values =>  { 
            setStat(values, 0, 'inner_fire_damage_mult_if_channeling_whirlwind')
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    105: {
        masteryRequired: 1,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setSource(values, 0, 'movement_speed_percent');
            setAsUpgrade(values, 0);
            synergyMultiply100(values, 0);
            setSynergyPrecision(values, 0, 0);
        }
    },
    106: {
        masteryRequired: 1,
        override: values =>  { 
            setStat(values, 0, 'skill_increased_damage_mult_against_broken_armor');
            setAsUpgrade(values, 0);
        }
    },
    107: {
        masteryRequired: 1,
        line: 2,
        override: values =>  { 
            addConstant(values, 8, false, EffectValueValueType.Upgrade, 'astral_retribution_if_enemies_in_range_count');
        },
        additionalClassMechanics: [ 217 ]
    },
    108: {
        masteryRequired: 1,
        line: 2,
        override: values =>  { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'can_move_through_enemies');
        }
    },
    109: {
        masteryRequired: 1,
        line: 2,
        override: values =>  {
            setStat(values, 0, 'block_stack_per_critical');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 218 ]
    },
    110: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'recast_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'recast_only_if_critical');
        }
    },
    111: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'arcane_beam_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'arcane_beam_chance_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    112: {
        masteryRequired: 3,
        line: 3,
        override: values =>  { 
            setStat(values, 0, 'tenacity_percent_while_channeling_whirlwind')
        }
    },
    113: {
        masteryRequired: 4,
        line: 4,
        override: values => { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, -25, false, EffectValueValueType.Stat, 'res_mag_armor_global_mult_while_channeling_whirlwind');
        }
    },
    114: {
        masteryRequired: 4,
        line: 4,
        override: values => { 
            setAsUpgrade(values, 0);
            variableToSynergy(values, 1, 'weapon_damage', 'physical_damage', 0, true);
            allowSynergyToCascade(values, 1);
            setAsUpgrade(values, 1);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skill_perfect_dancing_blade_chance');
        },
        additionalClassMechanics: [215]
    },
    115: {
        masteryRequired: 5,
        line: 4,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'arcane_beam_cast_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    116: {
        masteryRequired: 5,
        line: 4,
        override: values => { 
            setStat(values, 0, 'skill_increased_damage_mult_per_second_while_channeling_whirlwind');
            setAsUpgrade(values, 0);
            addConstant(values, 300, false, EffectValueValueType.Upgrade, 'skill_increased_damage_mult_max_while_channeling_whirlwind');
        }
    },
    117: {
        masteryRequired: 6,
        line: 5,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'skewing_max_stack');
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'skewing_stack_count_conversion');
        },
        additionalClassMechanics: [ 216 ]
    },
    118: {
        masteryRequired: 6,
        line: 5,
        override: values =>{ 
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'pull_aoe');
            addConstant(values, 30, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, -70, false, EffectValueValueType.Stat, 'movement_speed_mult_while_channeling_whirlwind');
        }
    },
    119: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'cooldown_time_add');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'no_longer_cost_per_second');
        }
    },
    120: {
        masteryRequired: 1,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'root_duration');
        }
    },
    121: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'training_lance_astral_retribution_chance_on_hit');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Flat, 'training_lance_astral_retribution_chance_on_hit_if_perfect');
        },
        additionalClassMechanics: [ 215, 217 ]
    },
    122: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'elder_lance_brut_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    123: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'training_lance_additional_damage_add');
            setAsUpgrade(values, 0);
        }
    },
    124: {
        masteryRequired: 1,
        line: 2,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'cosmic_stack_astral_retribution_increased_damage');
        },
        additionalClassMechanics: [ 217 ]
    },
    125: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'elder_lance_increased_damage_on_elite_percent');
            setAsUpgrade(values, 0);
        }
    },
    126: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'training_lance_rebound_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    127: {
        masteryRequired: 2,
        line: 3,
        override: values => { 
            setStat(values, 0, 'elder_lance_additional_damage_per_cosmic_stack');
        }
    },
    128: {
        masteryRequired: 2,
        line: 3,
        override: values => { 
            setStat(values, 0, 'elder_lance_ancestral_damage_per_cosmic_stack');
        }
    },
    129: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 75, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'skill_is_fast');
        }
    },
    130: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'apply_max_skewer_on_hit');
        },
        additionalClassMechanics: [ 216 ]
    },
    131: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            setStat(values, 0, 'elder_lance_skill_increased_damage_per_enemy_hit');
            setAsUpgrade(values, 0);
        }
    },
    132: {
        masteryRequired: 5,
        line: 4,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'additional_elder_lance');
        }
    },
    133: {
        masteryRequired: 5,
        line: 4,
        override: values => { 
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skill_trap_delay');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_trap_aoe');
        }
    },
    134: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            setStat(values, 0, 'additional_elder_lance_if_perfect');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [215]
    },
    135: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'additional_elder_lance_tour');
        }
    },
    136: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            setStat(values, 0, 'training_lance_chance_to_pierce_percent_if_low_life');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'training_lance_chance_to_pierce_percent_if_low_life_treshold');
            setStat(values, 1, 'elder_lance_increased_damage_mult_if_high_life');
            setAsUpgrade(values, 1);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'elder_lance_increased_damage_mult_if_high_life_treshold');
        }
    },
    137: {
        masteryRequired: 7,
        line: 5,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'add_twice_elder_lance_to_training_lance');
        }
    },
    138: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'res_phy_percent_per_banner');
        }
    },
    139: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'skewer_on_hit_if_fortunate');
        },
        additionalClassMechanics: [ 215, 216 ]
    },
    140: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_if_target_is_skewered');
        },
        additionalClassMechanics: [ 216 ]
    },
    141: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'refresh_banner_cooldown_on_kill');
        }
    },
    142: {
        masteryRequired: 2,
        override: values => {
            synergyMultiply100(values, 0);
        }
    },
    143: {
        masteryRequired: 2,
    },
    144: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_drop_randomly');
        }
    },
    145: {
        masteryRequired: 3,
    },
    146: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_on_critical');
        },
        additionalClassMechanics: [ 218 ]
    },
    147: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'skewer_max_stack_add');
        },
        additionalClassMechanics: [ 216 ]
    },
    148: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_provocation_banner_def_phy');
            setAsUpgrade(values, 0);
        }
    },
    149: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_regeneration_buff_mana_on_hit_add');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_knockback_on_land');
        }
    },
    150: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'banner_sluggishness_daze');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_sluggishness_stun_duration_on_land');
        }
    },
    151: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Stat, 'banner_haste_block_stack_per_second');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_knockback_on_land');
        },
        additionalClassMechanics: [ 218 ]
    },
    152: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'cooldown_reset_on_block');
        },
        additionalClassMechanics: [ 218 ]
    },
    153: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'banner_fixed_order');
        }
    },
    154: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skewer_damage_percent_add');
        },
        additionalClassMechanics: [ 216 ]
    },
    155: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'wood_stick_training_lance_stun_chance');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'wood_stick_training_lance_stun_duration');
        }
    },
    156: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'mighty_swing_cadence_whirlwind_crit_damage_percent');
        }
    },
    157: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'grappling_hook_crest_shield_cooldown_time_reduction_multiplier');
        }
    },
    158: {
        masteryRequired: 7,
    },
    159: {
        masteryRequired: 7,
        override: values => {            
            addConstant(values, 0, false, EffectValueValueType.Stat, 'garbage_stat');
            addConstant(values, 100, false, EffectValueValueType.Stat, 'reduced_damage_from_melee_percent_if_source_is_full_life');
        }
    },
    160: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'skewer_as_critical');
        },
        additionalClassMechanics: [ 216 ]
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
        additionalClassMechanics: [ 216 ]
    },
    163: {
        masteryRequired: 1,
    },
    164: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'astral_retribution_increased_damage_mult');
        },
        additionalClassMechanics: [ 217 ]
    },
    165: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_per_ennemy_hit');
            setAsUpgrade(values, 0);
        }
    },
    166: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_chance_is_lucky');
        },
        additionalClassMechanics: [ 218 ],
        additionalMechanics: [MechanicType.Lucky]
    },
    167: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'astral_retribution_on_fortunate');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'astral_meteor_on_perfect');
        },
        additionalClassMechanics: [215, 217]
    },
    168: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'stun_chance_add');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'stun_chance_add_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    169: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'pull_distance');
            setAsUpgrade(values, 0);
        }
    },
    170: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'inner_fire_is_lucky');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'overdrive_is_lucky');
        },
        additionalMechanics: [MechanicType.InnerFire, MechanicType.Overdrive, MechanicType.Lucky]
    },
    171: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'astral_retribution_chance_on_astral_kill');
        },
        additionalClassMechanics: [ 217 ]
    },
    172: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'crest_shield_cast_on_perfect_cast');
        },
        additionalClassMechanics: [215]
    },
    173: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Stat, 'luck_gained_on_cast');
        }
    },
    174: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'whirlwind_cast_on_block');
        },
        additionalClassMechanics: [ 218 ]
    },
    175: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ancestral_strike_chance_is_lucky');
        },
        additionalMechanics: [MechanicType.Lucky]
    },
    176: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'inner_fire_crit_chance_percent');
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    177: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'overdrive_crit_chance_percent');
        },
        additionalMechanics: [MechanicType.Overdrive]
    },
    178: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'always_max_damage_if_fortunate_or_perfect');
        },
        additionalClassMechanics: [215]
    },
    179: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'astral_meteor_increased_damage_mult');
        },
        additionalClassMechanics: [ 217 ]
    },
    180: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'purge_on_cast');
        }
    },
    181: {
        masteryRequired: 7,
        override: values => { 
            setStat(values, 0, 'second_chance_health_restored_percent');
            addConstant(values,3, false, EffectValueValueType.Duration, 'second_chance_cooldown');
        }
    },
    182: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'astral_meteor_recast_chance');
        },
        additionalClassMechanics: [ 217 ]
    },
    183: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 50, false, EffectValueValueType.Flat, 'chivalry_low_life_reduced_damage');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'chivalry_low_life_treshold');
            setStat(values, 0, 'chivalry_high_life_increased_damage');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'chivalry_high_life_treshold');
        }
    },
    184: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'astral_retribution_on_cast');
        },
        additionalClassMechanics: [ 217 ]
    },
    185: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'perfect_additional_projectile_add');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'recast_chance_percent_if_perfect');
        },
        additionalClassMechanics: [215]
    },
    186: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'keep_luck_chance');
        },
        additionalClassMechanics: [215]
    },
    187: {
        masteryRequired: 1,
    },
    188: {
        masteryRequired: 1,
    },
    189: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'block_stack_on_nullify');
        },
        additionalClassMechanics: [ 218 ]
    },
    190: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'block_stack_per_second');
        },
        additionalClassMechanics: [ 218 ]
    },
    191: {
        masteryRequired: 2,
    },
    192: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'skill_duration_add');
            setAsUpgrade(values, 0)
        }
    },
    193: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'min_block_stacks');
        },
        additionalClassMechanics: [ 218 ]
    },
    194: {
        masteryRequired: 3,
    },
    195: {
        masteryRequired: 3,
    },
    196: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'cooldown_time_reduction_per_hit_taken');
        }
    },
    197: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'retaliate_percent_on_blocked_hit');
            setStat(values, 1, 'thorns_percent_on_blocked_hit');
        },
        additionalClassMechanics: [ 218 ]
    },
    198: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Stat, 'astral_retribution_on_block');
        },
        additionalClassMechanics: [ 217, 218 ]
    },
    199: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'astral_retribution_per_nullified_attack_on_buff_end');
        },
        additionalClassMechanics: [215]
    },
    200: {
        masteryRequired: 5,
        override: values => {
            setSource(values, 0, 'critical_chance');
            setStat(values, 0, 'retaliate_crit_chance_percent');
            synergyMultiply100(values, 0);
        }
    },
    201: {
        masteryRequired: 5,
        override: values => {
            setSource(values, 0, 'critical_chance');
            setStat(values, 0, 'thorn_crit_chance_percent');
            synergyMultiply100(values, 0);}
    },
    202: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'skewer_on_hit_taken');
        },
        additionalClassMechanics: [ 216 ]
    },
    203: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Stat, 'retaliate_dot_duration');
        }
    },
    204: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'stun_on_block_chance');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'stun_on_block_duration');
        },
        additionalClassMechanics: [ 218 ]
    },
    205: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, -35, false, EffectValueValueType.Stat, 'the_speed_percent_in_combat');
        }
    },
    206: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Stat, 'enduring_protector_buff_reduced_damage_from_area_percent');
        }
    },
    207: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Stat, 'retaliate_add_damages_after_mitigation');
        }
    },
    208: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'garbage_stat');
            addConstant(values, 10, false, EffectValueValueType.Stat, 'block_damage_reduction_add');
        },
        additionalClassMechanics: [ 218 ]
    },
    209: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult')
        }
    },
    210: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'add_chest_stats_twice');
        }
    },
    211: {
        masteryRequired: 8,
    },
    212: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'block_stack_gain_add');
        },
        additionalClassMechanics: [ 218 ]
    },
    222: {
        masteryRequired: 10,
        override: values => {
            setSynergyAllowMinMax(values, 0, false);
        }
    },
}

export const DATA_SKILL_1: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            addConstant(values, 15, false, EffectValueValueType.Duration, 'skill_duration');
        },
        specialization: 214
    },
    1: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'assassin_haste_buff_dodge_global_mult');
        },
        specialization: 215
    },
    2: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_increased_damage')
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
        },
        specialization: 216
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
        }
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            addConstant(values, 1.2, false, EffectValueValueType.AreaOfEffect, 'skill_aoe');
        }
    },
    5: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
        }
    },
    6: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 6);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_radius');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'increased_damage_mult_per_second');
        }
    },
    7: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 20);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_duration');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        }
    },
    8: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 5);
            addConstant(values, 300, false, EffectValueValueType.Upgrade, 'max_charge');
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'void_arrow_count_if_fully_charged');
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_pierce_percent_if_fully_charged');
        }
    },
    9: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 11);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'climax_increased_damage');
        }
    },
    10: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 5);
            setAsUpgrade(values, 1);
            setValue(values, 1, 2);
            setStat(values, 2, 'wandering_arrow_damage');
            allowSynergyToCascade(values, 2);
            setUpgrade(values, 2, 4);
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'garbage_stat');
        },
        additionalGenres: []
    },
    11: {
        masteryRequired: 8,
        override: values => {
            setAsUpgrade(values, 0);
            setUpgrade(values, 0, 100);
            setStat(values, 0, 'increased_damage_mult');
            allowSynergyToCascade(values, 0);
        }
    },
    12: {
        masteryRequired: 2,
        override: values => { 
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_rebound_chance_percent');
        }
    },
    13: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_fork_chance_percent');
        }
    },
    14: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'trap_increased_damage_if_tracked');
        },
        additionalClassMechanics: [ 210 ]
    },
    15: {
        masteryRequired: 4,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'chance_to_pierce_percent');
        }
    },
    16: {
        masteryRequired: 4,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'fork_count');
        }
    },
    17: {
        masteryRequired: 5,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'increased_proj_speed_percent_if_tormented');
        }
    },
    18: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'dodge_global_mult_if_recent_delighted_arrow_shot');
            addConstant(values, 4, false, EffectValueValueType.Flat, 'garbage_stat');
        }
    },
    19: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'increased_damage_per_rebound');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'first_hit_after_rebound_increased_damage');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        }
    },
    20: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Flat, 'cooldown_set');
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_is_no_longer_fast');
        }
    },
    21: {
        masteryRequired: 7,
        order: 10,
        override: values => {
            setStat(values, 0, 'additional_projectile_add');
            setAsUpgrade(values, 0);
        }
    },
    22: {
        masteryRequired: 2,
        order: 11,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'arrow_shot_mana_on_kill_add');
        }
    },
    23: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'increased_damage_per_pierce');
            setAsUpgrade(values, 0);
        }
    },
    24: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'fork_reset_chance');
            setAsUpgrade(values, 0);
        }
    },
    25: {
        masteryRequired: 10,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    26: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_per_potential_projectile');
            setAsUpgrade(values, 0);
        }
    },
    27: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_cast_if_tormented');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 209 ]
    },
    28: {
        masteryRequired: 2,
        order: 34,
        override: values => {
            setStat(values, 0, 'travel_time_reduction');
            setAsUpgrade(values, 0);
        }
    },
    29: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'skill_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'skill_decreased_damage_mult');
            setAsUpgrade(values, 1);
        }
    },
    30: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'armor_broken_on_hit_chance');
            setAsUpgrade(values, 0);
        }
    },
    31: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'pull_range_on_cast');
            setAsUpgrade(values, 0);
        }
    },
    32: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Stat, 'damage_type_to_elemental');
            setAsUpgrade(values, 1);
        }
    },
    33: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'trap_spawn_on_cast_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 210 ]
    },
    34: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'additional_volleys');
            setAsUpgrade(values, 0);
        }
    },
    35: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, -25, false, EffectValueValueType.Flat, 'skill_aoe_increased_size_percent_mult');
            setStat(values, 0, 'additional_volleys');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        }
    },
    36: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'pull_ravenous_dagger_on_hit');
        },
        additionalClassMechanics: [ 209 ]
    },
    37: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'slow_on_hit_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'slow_on_hit_duration');
        }
    },
    38: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_per_enemy_in_aoe');
            setAsUpgrade(values, 0);
        }
    },
    39: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'health_on_kill_add');
            setAsUpgrade(values, 0);
        }
    },
    40: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'increased_damage_per_volley_before');
            setAsUpgrade(values, 0);
        }
    },
    41: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'delightful_rain_stack_cooldown_reduction_global_mult');
            addConstant(values, 25, false, EffectValueValueType.Flat, 'delightful_rain_max_stacks');
        }
    },
    42: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    43: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'garbage_stat');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, 30, false, EffectValueValueType.Upgrade, 'brut_chance_percent_while_ancestral_stab_slash_buff');
        }
    },
    44: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            setStat(values, 1, 'mana_cost_mult');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        }
    },
    45: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'recast_chance_percent_ignored'); // not used for any skill stat
            setAsUpgrade(values, 0);
        }
    },
    46: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'daze_on_hit_percent');
            addConstant(values, 4, false, EffectValueValueType.Flat, 'daze_on_hit_duration');
            setAsUpgrade(values, 0);
            setAsUpgrade(values, 1);
        }
    },
    47: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    48: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'increased_damage_per_poison_upgrade');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 211 ]
    },
    49: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            allowSynergyToCascade(values, 0);
        },
        additionalClassMechanics: [ 209 ]
    },
    50: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'elemental_resistance_broken_on_hit');
            setAsUpgrade(values, 0);
        }
    },
    51: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            setAsUpgrade(values, 0);
        }
    },
    52: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'crit_damage_percent');
            setAsUpgrade(values, 0);
        }
    },
    53: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'overdrive_on_kill');
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    54: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'garbage_stat');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 211 ]
    },
    55: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'double_damage_if_double_kill');
        }
    },
    56: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            setStat(values, 0, 'poison_health_leech_percent_if_delighted');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 211 ]
    },
    57: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'recast_of_recast_chance');
            setAsUpgrade(values, 0);
        }
    },
    58: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'reverse_projectile_speed_effect');
        }
    },
    59: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'increased_damage_on_elite_percent');
            setAsUpgrade(values, 0);
        }
    },
    60: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'mana_on_hit_add');
            setAsUpgrade(values, 0);
        }
    },
    61: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_global_mult');
            setAsUpgrade(values, 0);
        }
    },
    62: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'auto_aim');
        }
    },
    63: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'chance_to_pierce_percent');
            setAsUpgrade(values, 0);
        }
    },
    64: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'trap_spawn_on_first_hit');
        },
        additionalClassMechanics: [ 210 ]
    },
    65: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'ravenous_dagger_spawn_on_first_hit');
        },
        additionalClassMechanics: [ 209 ]
    },
    66: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'poison_on_hit');
        },
        additionalClassMechanics: [ 211 ]
    },
    67: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'skill_aoe_increased_size_percent_mult');
            setAsUpgrade(values, 0);
        }
    },
    68: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    69: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'brut_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    70: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'can_be_recast');
        }
    },
    71: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'homing_bolt_aoe');
        }
    },
    72: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'root_on_hit_duration_if_tormented');
            setAsUpgrade(values, 0);
        }
    },
    73: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'silence_on_hit_duration_if_tormented');
            setAsUpgrade(values, 0);
        }
    },
    74: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 5, true, EffectValueValueType.Upgrade, 'skill_duration_reduction_if_tormented')
        }
    },
    75: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'skill_duration_reduction');
            setAsUpgrade(values, 0);
        }
    },
    76: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'skill_range_add');
            setAsUpgrade(values, 0);
        }
    },
    77: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'blind_on_hit');
        }
    },
    78: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'mana_regen_add_if_delighted_and_enemy_has_latent_storm');
            setAsUpgrade(values, 0);
        }
    },
    79: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'the_speed_percent_per_latent_storm');
            setStat(values, 0, 'the_speed_percent_per_latent_storm_max');
            setAsUpgrade(values, 0);
        }
    },
    80: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            addConstant(values, 0.5, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        }
    },
    81: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'skill_spread_if_delighted');
            setAsUpgrade(values, 0);
        }
    },
    82: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'skill_duration_add');
        }
    },
    83: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_explosion_aoe');
        }
    },
    84: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'latent_storm_additional_damage');
            allowSynergyToCascade(values, 0);
        }
    },
    85: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'transfer_if_target_die');
        }
    },
    86: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'physical_damage');
        }
    },
    87: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            addConstant(values, 30, false, EffectValueValueType.Upgrade, 'latent_storm_stack_increased_damage');
            setStat(values, 0, 'latent_storm_max_stacks');
            setAsUpgrade(values, 0);
        }
    },
    88: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'additional_target');
        }
    },
    89: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'rebound_chance_percent_if_fully_charged');
        }
    },
    90: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    91: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    92: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'mana_cost_reduction_skill_mult');
            setAsUpgrade(values, 0);
        }
    },
    93: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'void_arrow_count_if_fully_charged_override');
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'garbage_stat');
        }
    },
    94: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    95: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'wormhole_on_hit');
        }
    },
    96: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    97: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
        }
    },
    98: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        },
        additionalGenres: [ SkillGenre.AreaOfEffect ],
        additionalClassMechanics: [ 210 ]
    },
    99: {
        masteryRequired: 6,
        line: 4
    },
    100: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'charge_speed_mult');
            setAsUpgrade(values, 0);
        }
    },
    101: {
        masteryRequired: 7,
        line: 5
    },
    102: {
        masteryRequired: 8,
        line: 5
    },
    103: {
        masteryRequired: 1,
        override: values => {
            setSource(values, 0, 'movement_speed_percent');
            setStat(values, 0, 'increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    104: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_damage_mult_per_target_left_health_percent');
        }
    },
    105: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_damage_mult_per_target_missing_health_percent');
        }
    },
    106: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, true, EffectValueValueType.Upgrade, 'increased_range');
        }
    },
    107: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'cost_and_cooldown');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'no_cost_if_tormented');
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'cooldown_time_multiplier_if_tormented');
        }
    },
    108: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cooldown_reset_on_climax');
        }
    },
    109: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'cooldown_reduction_percent_on_critical_strike');
            setAsUpgrade(values, 0);
        }
    },
    110: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'move_to_climax');
        }
    },
    111: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'climax_crit_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, -50, false, EffectValueValueType.Upgrade, 'climax_increased_damage_add');
        }
    },
    112: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'blind_duration');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'blind_on_climax_aoe');
        }
    },
    113: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    114: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'spawn_trap_on_climax_and_tormented');
        },
        additionalClassMechanics: [ 210 ]
    },
    115: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'overdrive_chance_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Flat, 'overdrive_count_mult')
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    116: {
        masteryRequired: 6,
        line: 5,
        additionalClassMechanics: [ 209 ]
    },
    117: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            setStat(values, 0, 'opposite_finesse_increased_damages');
            setAsUpgrade(values, 0);
        }
    },
    118: {
        masteryRequired: 1,
        override: values => {
        }
    },
    119: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'travel_back_additional_damage_per_remaining_instructions');
            setAsUpgrade(values, 0);
        }
    },
    120: {
        masteryRequired: 1,
        override: values => {{
            setStat(values, 0, 'instructions_add');
            setAsUpgrade(values, 0);
        }}
    },
    121: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setSource(values, 0, 'skill_mana_cost');
            setAsUpgrade(values, 0);
        }
    },
    122: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'brut_chance_percent_per_yard_with_immortal_arrow');
        }
    },
    123: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'garbage_stat'); // inner_fire_chance_percent
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'can_trigger_inner_fire');
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    124: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    125: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            values.push(effectValueSynergy(0, 100, EffectValueUpgradeType.UpgradeRank, true, 'additional_projectile', 'additional_instructions', EffectValueValueType.Upgrade))
        }
    },
    126: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'garbage_stat');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'serenity_per_hit');
        }
    },
    127: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crit_damage_percent_per_instruction');
        }
    },
    128: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'stun_duration');
        }
    },
    129: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'crit_chance_percent_per_traveled_yard');
        }
    },
    130: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'exhilerating_senses_stack_attack_speed_global_mult');
        }
    },
    131: {
        masteryRequired: 6,
        line: 5
    },
    132: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 1, 'physical_damage');
            allowSynergyToCascade(values, 1);
            setAsUpgrade(values, 1);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'impatient_arrow_stack_per_second');
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'impatient_arrow_stack_shockwave_chance');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'impatient_arrow_shockwave_aoe');
        }
    },
    133: {
        masteryRequired: 1
    },
    134: {
        masteryRequired: 1
    },
    135: {
        masteryRequired: 1,
        override: values => {
            setAsUpgrade(values, 0);
        }
    },
    136: {
        masteryRequired: 2
    },
    137: {
        masteryRequired: 2
    },
    138: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'light_arrow_increased_damage')
        }
    },
    139: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_deafult_serenity_drop');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_serenity_drop');
        }
    },
    140: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'garbage_stat');
        },
        additionalClassMechanics: [ 209, 211 ]
    },
    141: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'the_max_health_percent_per_totem');
        }
    },
    142: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_enemies')
        },
        additionalClassMechanics: [ 209 ]
    },
    143: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'turret_syndrome_spawn_chance_on_kill');
        }
    },
    144: {
        masteryRequired: 4
    },
    145: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'trap_arm_time_reduction_mult');
        },
        additionalClassMechanics: [ 210 ]
    },
    146: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    147: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'trap_increased_damage_percent');
        },
        additionalClassMechanics: [ 210 ]
    },
    148: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'light_arrow_chance_to_pierce_percent');
        }
    },
    149: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_additional_rearm');
        },
        additionalClassMechanics: [ 210 ]
    },
    150: {
        masteryRequired: 6,
        override: values => { 
            allowSynergyToCascade(values, 0);
        }
    },
    151: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'light_arrow_shared_projectile_modifiers_aoe');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'light_arrow_shared_projectile_modifiers');
        }
    },
    152: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'turret_syndrome_reduced_cooldown_per_serenity');
            
        }
    },
    153: {
        masteryRequired: 7
    },
    154: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'turret_syndrome_on_cooldown_dodge_percent')
        }
    },
    155: {
        masteryRequired: 7,
        override: values => { 
            setStat(values, 0, 'life_on_hit_if_tormented')
            
        }
    },
    156: {
        masteryRequired: 8
    },
    157: {
        masteryRequired: 8,
    },
    158: {
        masteryRequired: 1,
        override: values => { 
            setStat(values, 0, 'isolated_target_increased_damage');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'isolated_target_distance');
        }
    },
    159: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'assassin_haste_buff_movement_speed');
        }
    },
    160: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'negative_effect_target_increased_damage');
        }
    },
    161: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'close_target_increased_damage');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'close_target_radius');
        }
    },
    162: {
        masteryRequired: 2
    },
    163: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'tumble_cooldown_reset_chance_on_cast');
        }
    },
    164: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'self_control_attack_speed_global_mult');
            addConstant(values, 8, false, EffectValueValueType.Duration, 'self_control_disabled_duration');
        }
    },
    165: {
        masteryRequired: 3,
        override: values => { 
            setStat(values, 0, 'poisoned_enemy_increased_damage');
        },
        additionalClassMechanics: [ 211 ]
    },
    166: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'last_cast_tormented_remove_cost');
        }
    },
    167: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'last_cast_tormented_crit_chance_percent');
        }
    },
    168: {
        masteryRequired: 4,
    },
    169: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_tumble_cast');
        },
        additionalClassMechanics: [ 209 ]
    },
    170: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_tumble_cast');
        },
        additionalClassMechanics: [ 210 ]
    },
    171: {
        masteryRequired: 5
    },
    172: {
        masteryRequired: 5
    },
    173: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_on_tumble_cast');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_on_tumble_land');
        }
    },
    174: {
        masteryRequired: 6
    },
    175: {
        masteryRequired: 6
    },
    176: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_on_tumble_land');
        },
        additionalClassMechanics: [ 209 ]
    },
    177: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arrow_shot_void_arrow_immortal_arrow_repeal_non_elemental_projectile');
        }
    },
    178: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'tormented_movement_speed');
        }
    },
    179: {
        masteryRequired: 7
    },
    180: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'critical_strike_chance_is_lucky');
        }
    },
    181: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 1, 'tormented_additional_projectile_add');
            setStat(values, 2, 'arrow_shot_void_arrow_heavy_explosive_increased_mana_cost');
        }
    },
    182: {
        masteryRequired: 1,
    },
    183: {
        masteryRequired: 1,
    },
    184: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_crit_chance_percent');
        }
    },
    185: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_serenity_increase_default');
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_serenity_increase_total');
        }
    },
    186: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Flat, 'idle_armor_penetration_percent');
        }
    },
    187: {
        masteryRequired: 2,
        additionalMechanics: [MechanicType.InnerFire]
    },
    188: {
        masteryRequired: 2,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'skill_duration_add');
        }
    },
    189: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trigger_all_ravenous_dagger_at_once');
        },
        additionalClassMechanics: [ 209 ]
    },
    190: {
        masteryRequired: 3,
        override: values => {
            setAsUpgrade(values, 0);
            setStat(values, 0, 'ravenous_dagger_explosions_on_trigger');
        },
        additionalClassMechanics: [ 209 ]
    },
    191: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'smoke_screen_buff_ignore_incoming_attacks');
        }
    },
    192: {
        masteryRequired: 4
    },
    193: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'gold_drop_on_critical_strike');
        }
    },
    194: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'smoke_screen_buff_mana_regen_global_mult');
        }
    },
    195: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_cast');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'trap_spawn_on_buff_end');
        },
        additionalClassMechanics: [ 210 ]
    },
    196: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_tormented');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_delighted');
        },
        additionalClassMechanics: [ 209 ]
    },
    197: {
        masteryRequired: 5,
        override: values => { 
            setStat(values, 0, 'poison_increased_damage_per_poisoned_enemy');
            addConstant(values, 5, false, EffectValueValueType.AreaOfEffect, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    198: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'movement_speed_after_trap_triggered');
        },
        additionalClassMechanics: [ 210 ]
    },
    199: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_spawn_on_evade');
        },
        additionalClassMechanics: [ 209 ]
    },
    200: {
        masteryRequired: 6
    },
    201: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 1.5, false, EffectValueValueType.Upgrade, 'smoke_screen_stun_aoe_on_cast_range');
            setAsUpgrade(values, 0);
            setStat(values, 0, 'smoke_screen_stun_aoe_on_cast_duration');
        },
        additionalClassMechanics: [ 211 ]
    },
    202: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'garbage_stat');
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    203: {
        masteryRequired: 7
    },
    204: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'poison_increased_damage');
        },
        additionalClassMechanics: [ 211 ]
    },
    205: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'garbage_stat');
        },
        additionalClassMechanics: [ 211 ]
    },
    206: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'ravenous_dagger_pull_on_smoke_screen_end');
        },
        additionalClassMechanics: [ 209, 210 ]
    },
    217: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [ 210 ]
    },
    218: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 0.5, false, EffectValueValueType.Upgrade, 'garbage_stat');
        }
    },
    219: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'garbage_stat');
        }
    },
    220: {
        masteryRequired: 7,
        line: 5
    }
}

export const DATA_SKILL_2: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'duration');
            setAsUpgrade(values, 0)
            addConstant(values, 40, false, EffectValueValueType.Upgrade, 'slow_percent');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'slow_duration');
            addConstant(values, -90, false, EffectValueValueType.Upgrade, 'projectile_slow_percent');
        },
        specialization: 220,
        additionalGenres: [SkillGenre.Temporal]
    },
    1: {
        masteryRequired: null,
        specialization: 221,
        additionalGenres: [SkillGenre.Temporal]
    },
    2: {
        masteryRequired: null,
        specialization: 222,
        additionalGenres: [SkillGenre.Arcanic]
    },
    3: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 5);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 1);
        },
        additionalGenres: [SkillGenre.Arcanic]
    },
    4: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 1);
            addConstant(values, 35, false, EffectValueValueType.Upgrade, 'increased_damage_per_power');
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'max_power');
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'skill_2_4_tick_per_second');
        },
        additionalGenres: [SkillGenre.Obliteration]
    },
    5: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 6);
        },
        additionalGenres: [SkillGenre.Obliteration]
    },
    6: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 15);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 2);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'aoe');
        },
        additionalGenres: [SkillGenre.Temporal]
    },
    7: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
            setAsUpgrade(values, 0);
            addConstant(values, 250, false, EffectValueValueType.Upgrade, 'chrono_pucture_skill_increased_damage_mult');
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'chrono_pucture_default_damage_mult');
        },
        additionalGenres: [SkillGenre.Temporal]
    },
    8: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 4);
            setAsUpgrade(values, 0);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 1);
            setAsUpgrade(values, 1);
        },
        additionalGenres: [SkillGenre.Arcanic]
    },
    9: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 3);
            setAsUpgrade(values, 0);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 1);
            setAsUpgrade(values, 1);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_duration');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'aoe');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'ticks_per_second');
        },
        additionalGenres: [SkillGenre.Arcanic]
    },
    10: {
        masteryRequired: null,
        override: values => {
            setStat(values, 0, 'physical_damage');
            allowSynergyToCascade(values, 0);
            setUpgrade(values, 0, 9);
            setStat(values, 1, 'elemental_damage');
            allowSynergyToCascade(values, 1);
            setUpgrade(values, 1, 2);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'chance_to_pierce_percent');
        },
        additionalGenres: [SkillGenre.Arcanic]
    },
    11: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'skill_has_no_cost_if_low_mana_treshold');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'garbage_stat');
            setAsUpgrade(values, 1);
            addConstant(values, -100, false, EffectValueValueType.Upgrade, 'skill_has_no_cost_if_low_mana');
        }
    },
    12: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
        }
    },
    13: {
        masteryRequired: 3,
        override: values => {
            setAsUpgrade(values, 0);
        }
    },
    14: {
        masteryRequired: 2,
        line: 1,
        additionalClassMechanics: [217, 218]
    },
    15: {
        masteryRequired: 6,
        order: 20,
        line: 3,
        override: values => {
            setStat(values, 0, 'arcane_max_stacks')
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'arcane_stack_additional_projectile_add');
        }
    },
    16: {
        masteryRequired: 4,
        order: 21,
        override: values => {
            setStat(values, 0, 'mana_from_hit_recovery_to_elemental_damage');
            setAsUpgrade(values, 0);
        }
    },
    17: {
        masteryRequired: 3,
        order: 12,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skill_is_now_temporal');
        }
    },
    18: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'pierce_fork_rebound_is_highest');
        }
    },
    19: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    20: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'remnant_cast_on_cast_count');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'remnant_cast_on_cast_chance');
        },
        additionalClassMechanics: [217, 218]
    },
    21: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'arcane_on_hit_if_at_least_one_obliteration_emblem');
        },
        additionalClassMechanics: [214, 216]
    },
    22: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0,'remnant_time_lock_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [215, 217]
    },
    23: {
        masteryRequired: 8,
    },
    24: {
        masteryRequired: 6,
        line: 3,
        override: values => {
            setAsUpgrade(values, 0);
        }
    },
    25: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'lost_in_time_aoe');
            setValueType(values, 0, EffectValueValueType.AreaOfEffect);
        },
        additionalClassMechanics: [215]
    },
    26: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_per_potential_projectile');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'merges_as_one_projectile');
        }
    },
    27: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'res_phy_percent_if_channeling_ray_of_obliteration');
            setStat(values, 1, 'res_mag_percent_if_channeling_ray_of_obliteration');
        }
    },
    28: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'inner_fire_chance_tick');
            setAsUpgrade(values, 0);
        },
        additionalMechanics: [MechanicType.InnerFire],
        additionalClassMechanics: [218]
    },
    29: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [218]
    },
    30: {
        masteryRequired: 2,
        order: 26,
        override: values => {
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [218]
    },
    31: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    32: {
        masteryRequired: 6,
        order: 37,
        override: values => {
            setStat(values, 0, 'increased_range_mult');
            setAsUpgrade(values, 0);
        }
    },
    33: {
        masteryRequired: 10,
        order: 39,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    34: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'knockback_delay');
        }
    },
    35: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'slow_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 2.5, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'garbage_stat');
        }
    },
    36: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'ray_of_obliteration_overdrive_chance_percent');
            setSource(values, 0, 'overdrive_chance');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'overdrive_chance_percent_while_channeling_ray_of_obliteration');
        },
        additionalClassMechanics: [218]
    },
    37: {
        masteryRequired: 5,
        order: 35,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult_if_short');
            setAsUpgrade(values, 0);
        }
    },
    38: {
        masteryRequired: 9,
        override: values => {
            setStat(values, 0, 'side_ray_add');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'side_ray_skill_decreased_damage_mult');
        }
    },
    39: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'increased_damage_per_power');
            setAsUpgrade(values, 0);
        }
    },
    40: {
        masteryRequired: 9,
        order: 37,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'no_longer_cost_per_second');
        }
    },
    41: {
        masteryRequired: 7,
        order: 27,
        line: 4,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'full_strength_if_no_obliteration_emblems_count');
        }
    },
    42: {
        masteryRequired: 2,
        line: 1,
        override: values => {
            setStat(values, 0, 'movement_speed_if_channeling');
            setAsUpgrade(values, 0);
        }
    },
    43: {
        masteryRequired: 8,
        order: 57,
        line: 5,
        override: values => {
            setSource(values, 0, 'completed_achievements');
            setStat(values, 0, 'skill_increased_damage_mult');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    44: {
        masteryRequired: 9,
        order: 58,
        line: 5,
        override: values => {
            setSource(values, 0, 'maxed_upgrades');
            setStat(values, 0, 'brut_damage_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    45: {
        masteryRequired: 1,
        order: 40,
        additionalClassMechanics: [216]
    },
    46: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
            allowSynergyToCascade(values, 0);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'smash_aoe');
        }
    },
    47: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'overdrive_inner_fire_additional_damage_when_triggered_by_book_smash');
        },
        additionalMechanics: [MechanicType.InnerFire, MechanicType.Overdrive]
    },
    48: {
        masteryRequired: 3,
    },
    49: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'silence_duration');
        }
    },
    50: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'attunment_pulse_remnant_cast_chance_per_arcanic_emblem');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'rift_nova_remnant_cast_chance_per_temporal_emblem');
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: [214, 217]
    },
    51: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'remnant_per_non_obliteration_emblem');
        },
        additionalClassMechanics: [214, 217]
    },
    52: {
        masteryRequired: 5,
        line: 3,
        override: values => {
            setStat(values, 0, 'attack_speed_percent');
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    53: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    54: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_per_inner_fire');
            setAsUpgrade(values, 0);
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    55: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'has_betime_effect');
        },
        additionalClassMechanics: [215]
    },
    56: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier_per_temporal_emblem');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'cost_reduction_mult_skill_per_arcanic_emblem');
            setAsUpgrade(values, 1);
        },
        additionalClassMechanics: [214]
    },
    57: {
        masteryRequired: 1,
        order: 41,
        override: values => {
            setStat(values, 0, 'recast_chance_percent_per_non_obliteration_emblem');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    58: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'emblems_on_cast');
        },
        additionalClassMechanics: [214]
    },
    59: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'crit_damage_percent_per_arcanic_emblem');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    60: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'remnant_vulnerability_remnant_increased_damage_mult');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [217]
    },
    61: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'skill_decreased_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    62: {
        masteryRequired: 3,
        line: 2,
        override: values => {
            setStat(values, 0, 'max_charged_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'charge_max_time');
        }
    },
    63: {
        masteryRequired: 3,
        line: 2,
        override: values => { 
            setStat(values, 0, 'skill_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
        }
    },
    64: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'high_spirit_stacks_skill_increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'high_spirit_stack_duration');
        }
    },
    65: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'increased_knockback');
        }
    },
    66: {
        masteryRequired: 5,
        line: 3,
        override: values => {
            setStat(values, 0, 'skill_elemental_damage_mult');
            setSynergyPrecision(values, 0, 1);
            synergyMultiply100(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    67: {
        masteryRequired: 5,
        line: 3,
        override: values => { 
            setStat(values, 0, 'crit_chance_percent');
            setAsUpgrade(values, 0);
        }
    },
    68: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'cast_on_cursor');
        }
    },
    69: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'remnant_recast_chance');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'remnant_on_cast');
        },
        additionalClassMechanics: [217]
    },
    70: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    71: {
        masteryRequired: 7,
        line: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'delay');
        }
    },
    72: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult_per_non_temporal_emblem');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    73: {
        masteryRequired: 9,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'projectiles_stop_duration');
        }
    },
    74: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skill_is_now_obliteration');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'chrono_puncture_is_obliteration');
        }
    },
    75: {
        masteryRequired: 1,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'time_lock_on_critical');
        },
        additionalClassMechanics: [215]
    },
    76: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'temporal_sentence_chance');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'elemental_damage');
            setAsUpgrade(values, 1);
            allowSynergyToCascade(values, 1);
        },
        additionalClassMechanics: [214]
    },
    77: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'garbage_stat');
            setAsUpgrade(values, 0);
        }
    },
    78: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'chrono_manamorphosis_max_stacks');
            addConstant(values, 2, false, EffectValueValueType.Stat, 'chrono_manamorphosis_stack_the_max_mana_percent');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'chrono_manamorphosis_stack_duration');
        }
    },
    79: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'chrono_armor_max_stacks');
            addConstant(values, 3, false, EffectValueValueType.Stat, 'chrono_armor_stack_res_phy_percent');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'chrono_armor_stack_duration');
        }
    },
    80: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'chrono_empower_max_stacks');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'chrono_empower_stack_duration');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'chrono_empower_stack_skill_increased_damage_mult');
        }
    },
    81: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'chrono_speed_max_stacks');
            addConstant(values, 2, false, EffectValueValueType.Stat, 'chrono_speed_stack_cooldown_reduction_global_mult');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'chrono_speed_stack_duration');
        }
    },
    82: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'multi_hit_remnant_chance');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214, 217]
    },
    83: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'arcane_bond_hit_count');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [216, 217]
    },
    84: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'inner_fire_chance_percent');
            setAsUpgrade(values, 0);
        },
        additionalMechanics: [MechanicType.InnerFire]
    },
    85: {
        masteryRequired: 4,
        line: 3,
        override: values => {
            setStat(values, 0, 'traumatized_max_stacks');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'traumatized_stack_double_damages');
        }
    },
    86: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'traumatized_kill_trigger_temporal_sentence');
        }
    },
    87: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'mana_lost_and_refunded_on_arcane_bond_hit');
        },
        additionalClassMechanics: [216]
    },
    88: {
        masteryRequired: 6,
        line: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 0.5, false, EffectValueValueType.AreaOfEffect, 'chrono_burst_aoe');
        }
    },
    89: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            setStat(values, 0, 'increased_max_chrono_stacks');
        }
    },
    90: {
        masteryRequired: 8,
        order: 91,
        line: 5,
        override: values => {
            setStat(values, 0, 'lost_in_time_increased_damage_mult');
            setAsUpgrade(values, 0)
        },
        additionalClassMechanics: [215]
    },
    91: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'arcane_bond_on_hit_if_arcane');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [216]
    },
    92: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'time_lock_on_hit_if_temporal');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [215]
    },
    93: {
        masteryRequired: 1,
        override: values => {
            setSource(values, 0, 'brut_chance_percent');
            setStat(values, 0, 'crit_chance_percent_if_obliteration');
            synergyMultiply100(values, 0);
            setSynergyPrecision(values, 0, 0);
            setAsUpgrade(values, 0);
        }
    },
    94: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'mana_on_hit_add_if_target_has_arcanic_discordance');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'slow_percent_if_target_has_temporal_discordance');
            setAsUpgrade(values, 1);
            setStat(values, 2, 'elemental_weakness_percent_if_target_has_obliteration_discordance');
            setAsUpgrade(values, 2);
        }
    },
    95: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult_on_way_back');
            setAsUpgrade(values, 0);
        }
    },
    96: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'destroy_enemy_projectiles');
        }
    },
    97: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            setStat(values, 0, 'knockback_increased_percent_if_target_has_obliteration_discordance');
            setAsUpgrade(values, 0);
        }
    },
    98: {
        masteryRequired: 2,
        line: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'increased_duration_on_clone_hit');
        },
        additionalClassMechanics: [218]
    },
    99: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_per_same_emblems');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    100: {
        masteryRequired: 4,
        order: 101,
        line: 3,
        override: values => {
            setStat(values, 0, 'increased_duration_on_same_school_hit');
            setAsUpgrade(values, 0);
        }
    },
    101: {
        masteryRequired: 3,
        order: 100,
        line: 3,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'remnant_cast_if_same_emblem');
        },
        additionalClassMechanics: [214, 217]
    },
    102: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'remnant_cast_if_last_3_emblems_different');
        },
        additionalClassMechanics: [214]
    },
    103: {
        masteryRequired: 6,
        order: 105,
        line: 4,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Stat, 'remnant_cast_if_target_has_all_discordance');
        },
        additionalClassMechanics: [217]
    },
    104: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'attunment_pulse_school_rotation_on_other_skill_cast');
        }
    },
    105: {
        masteryRequired: 7,
        order: 101,
        line: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    106: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 0.5, false, EffectValueValueType.Upgrade, 'charge_duration');
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'fully_charged_multicast_count');
        }
    },
    107: {
        masteryRequired: 8,
        line: 5,
        override: values => {
            addConstant(values, 40, false, EffectValueValueType.Upgrade, 'size_reduction');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'skill_is_projectile');
        },
        additionalClassMechanics: [217]
    },
    108: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'tempore_clone_spawn_chance_on_breach_end');
            setAsUpgrade(values, 0);
        }
    },
    109: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'the_max_mana_percent_per_enemy_in_breach_range');
            setStat(values, 1, 'mana_regen_add_per_enemy_in_breach_range');
        }
    },
    110: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'first_tick_skill_increased_damage_mult');
            synergyMultiply100(values, 0);
            setSynergyPrecision(values, 0, 0);
            setAsUpgrade(values, 0);
            allowSynergyToCascade(values, 0);
        }
    },
    111: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'cost_mult_skill_per_arcanic_emblem');
        },
        additionalClassMechanics: [214]
    },
    112: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 100, false, EffectValueValueType.Upgrade, 'skill_decreased_damage_mult');
        }
    },
    113: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'refresh_arcane_bond_on_hit');
        },
        additionalClassMechanics: [216]
    },
    114: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'skill_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'delay_spawn');
        }
    },
    115: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_if_remnant_and_target_in_breach');
        },
        additionalClassMechanics: [217]
    },
    116: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'arcane_bond_increased_damage_mult_if_in_breach_range');
        },
        additionalClassMechanics: [216]
    },
    117: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'teleport_on_breach_touch');
        }
    },
    118: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'arcane_flux_max_stacks');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'arcane_flux_stack_cooldown_reduction_global_mult');
            addConstant(values, 2, false, EffectValueValueType.Stat, 'arcane_flux_duration');
        }
    },
    119: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            setStat(values, 0, 'skill_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'garbage_stat');
            addConstant(values, 4, false, EffectValueValueType.Upgrade, 'skill_duration_reduction');
        }
    },
    120: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            setStat(values, 0, 'arcane_breach_collision_stack_aoe_increased_size_percent');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'temporal_breach_collision_stack_duration_add');
            setAsUpgrade(values, 1);
            setStat(values, 2, 'obliteration_breach_stack_skill_increased_damage_mult');
            setAsUpgrade(values, 2);
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'breach_collision_max_stacks');
        }
    },
    121: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'arcane_clone_attack_speed_global_mult_if_in_breach');
            
        },
        additionalClassMechanics: [218]
    },
    122: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'arcane_explosion_aoe');
        }
    },
    123: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'pull_enemies_in_range');
        }
    },
    124: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult_per_arcanic_emblem');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    125: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            synergyMultiply100(values, 0);
            setSynergyPrecision(values, 0, 0);
            setAsUpgrade(values, 0);
        }
    },
    126: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'bounce_to_remnant_chance');
            setAsUpgrade(values, 0);
            setSource(values, 0, 'chance_to_rebound');
            synergyMultiply100(values, 0);
            setSynergyPrecision(values, 0, 0);
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'bounce_to_remnant_count');
            addConstant(values, 5, false, EffectValueValueType.Upgrade, 'rebound_chance_percent');
        },
        additionalClassMechanics: [217]
    },
    127: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'orb_arcane_master_skill_decreased_damage_mult');
        }
    },
    128: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_per_arcanic_emblem');
            setAsUpgrade(values, 0);
            setStat(values, 1, 'crit_damage_percent_per_obliteration_emblem');
            setAsUpgrade(values, 1);
            setStat(values, 2, 'brut_chance_percent_per_temporal_emblem');
            setAsUpgrade(values, 2);
        },
        additionalClassMechanics: [214]
    },
    129: {
        masteryRequired: 1,
        line: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    130: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'mastery_cooldown_time_reduction_multiplier');
            allowSynergyToCascade(values, 0);
            setAsUpgrade(values, 0);
        }
    },
    131: {
        masteryRequired: 2,
        line: 3,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [218]
    },
    132: {
        masteryRequired: 3,
        line: 3,
        override: values => {
            setStat(values, 0, 'skill_elemental_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    133: {
        masteryRequired: 4,
        line: 4,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
        }
    },
    134: {
        masteryRequired: 4,
        line: 4,
        additionalClassMechanics: [217]
    },
    135: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_temporal_explosion_aoe');
        }
    },
    136: {
        masteryRequired: 5,
        line: 4,
        override: values => {
            setStat(values, 0, 'additional_projectile_add');
            setAsUpgrade(values, 0);
            addConstant(values, 50, false, EffectValueValueType.Upgrade, 'orb_arcane_master_skill_decreased_damage_mult');
        }
    },
    137: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            setStat(values, 0, 'cooldown_time_reduction_multiplier');
            setAsUpgrade(values, 0);
        }
    },
    138: {
        masteryRequired: 6,
        line: 5,
        override: values => {
            setStat(values, 0, 'skill_decreased_damage_mult_if_only_obliteration');
            setAsUpgrade(values, 0);
        },
        additionalClassMechanics: [214]
    },
    139: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            setStat(values, 0, 'remnant_orb_arcane_master_cast_count');
            setAsUpgrade(values, 0);
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'remnant_orb_arcane_master_cast_tick');
        },
        additionalClassMechanics: [214, 217]
    },
    140: {
        masteryRequired: 7,
        line: 5,
        override: values => {
            setStat(values, 0, 'skill_increased_damage_mult');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'orb_arcane_master_cooldown_time_add');
        }
    },
    141: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'slow_percent');
            setAsUpgrade(values, 0);
        }
    },
    142: {
        masteryRequired: 1,
    },
    143: {
        masteryRequired: 1,
    },
    144: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'speed_gate_buff_the_speed_percent');
            addConstant(values, 5, false, EffectValueValueType.Stat, 'speed_gate_buff_duration');
        }
    },
    145: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'arcane_bond_increased_damage_mult_if_close');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'proximity_alert_range');
        },
        additionalClassMechanics: [216]
    },
    146: {
        masteryRequired: 2,
    },
    147: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'chance_to_pierce_percent_if_projectile_passed_through_wall_of_omen');
            setStat(values, 1, 'increased_proj_speed_percent_if_projectile_passed_through_wall_of_omen');

        }
    },
    148: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'increased_damage_mult_if_target_is_time_locked');
        },
        additionalClassMechanics: [215]
    },
    149: {
        masteryRequired: 3,
        override: values => {
            setSynergyPrecision(values, 0, 0);
        }
    },
    150: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_if_target_is_time_locked');
        },
        additionalClassMechanics: [215]
    },
    151: {
        masteryRequired: 4,
    },
    152: {
        masteryRequired: 4,
    },
    153: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'physical_damage');
            setAsUpgrade(values, 0);
        }
    },
    154: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'invigorate_stack_elemental_damage_percent');
            setStat(values, 1, 'invigorate_max_stacks');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'invigorate_stack_duration');
        },
        additionalClassMechanics: [215]
    },
    155: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Stat, 'arcane_bond_on_hit_if_last_emblems_different');
        },
        additionalClassMechanics: [214, 216]
    },
    156: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'destroy_enemy_projectiles');
        }
    },
    157: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 35, false, EffectValueValueType.Stat, 'remnant_rift_nova_cast_if_low_life_treshold');
        },
        additionalClassMechanics: [217]
    },
    158: {
        masteryRequired: 6,
        override: values => {
            setStat(values, 0, 'additional_projectile_add_if_next_cast_is_new_emblem');
            setStat(values, 1, 'overdrive_chance_percent_if_next_cast_is_new_emblem');
        },
        additionalMechanics: [MechanicType.Overdrive],
        additionalClassMechanics: [214]
    },
    159: {
        masteryRequired: 7,
    },
    160: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'time_lock_duration_add');
        },
        additionalClassMechanics: [215]
    },
    161: {
        masteryRequired: 7,
    },
    162: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'split_projectiles');
        },
        additionalClassMechanics: [217]
    },
    163: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Stat, 'max_emblems');
            addConstant(values, 2, false, EffectValueValueType.Stat, 'max_emblems_add');
        },
        additionalClassMechanics: [214]
    },
    164: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'attack_speed_per_arcanic_emblem');
            setStat(values, 1, 'cooldown_reduction_per_temporal_emblem');
            setStat(values, 2, 'damage_per_obliteration_emblem');
            setStat(values, 3, 'garbage_stat');
        },
        additionalClassMechanics: [214]
    },
    165: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'cost_refund');
        }
    },
    166: {
        masteryRequired: 1,
        override: values => {
            synergyMultiply100(values, 0);
        }
    },
    167: {
        masteryRequired: 1,
    },
    168: {
        masteryRequired: 6
    },
    169: {
        masteryRequired: 2,
        order: 173
    },
    170: {
        masteryRequired: 6
    },
    171: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'recast_delay');
        }
    },
    172: {
        masteryRequired: 2
    },
    173: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'life_on_hit_gain_as_mana');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'life_on_kill_gain_as_mana');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'life_leech_gain_as_mana');
        }
    },
    174: {
        masteryRequired: 3
    },
    175: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'remnant_increased_damage_mult');
        },
        additionalClassMechanics: [217]
    },
    176: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'mana_resonance_aoe');
        },
        additionalClassMechanics: [216]
    },
    177: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 10, false, EffectValueValueType.Upgrade, 'cooldown_reset_if_health_lost_treshold');
        },
        additionalClassMechanics: [215]
    },
    178: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            setAsUpgrade(values, 0);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'temporal_clone_explosion_delay');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'temporal_clone_explosion_aoe');
        }
    },
    179: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'remnant_overdrive_overdrive_chance_percent');
        },
        additionalMechanics: [MechanicType.Overdrive],
        additionalClassMechanics: [217]
    },
    180: {
        masteryRequired: 5
    },
    181: {
        masteryRequired: 6,
        order: 169,
        override: values => {
            setStat(values, 0, 'clone_max_health');
            setAsUpgrade(values, 0);
        }
    },
    182: {
        masteryRequired: 3,
        order: 172,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'recast_duration');
            addConstant(values, 2, false, EffectValueValueType.Upgrade, 'cooldown_time_add_per_recast');
        },
        additionalClassMechanics: [214]
    },
    183: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Flat, 'max_emblems');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'max_emblems_add');
        },
        additionalClassMechanics: [214]
    },
    184: {
        masteryRequired: 7,
    },
    185: {
        masteryRequired: 7,
    },
    186: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, -50, false, EffectValueValueType.Stat, 'the_max_health_global_mult');
        }
    },
    187: {
        masteryRequired: 2,
        additionalClassMechanics: [217]
    },
    188: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            addConstant(values, 4, false, EffectValueValueType.Stat, 'remnant_cloud_max_grow');
            addConstant(values, 1, false, EffectValueValueType.Stat, 'remnant_cloud_explosion_delay');
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'remnant_cloud_explosion_aoe');
        },
        additionalClassMechanics: [217]
    },
    189: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'retaliate_percent_if_channeling_arcane_barrier');
        },
        additionalClassMechanics: [218]
    },
    190: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'damage_taken_to_mana_percent');
        }
    },
    191: {
        masteryRequired: 1,
        override: values => {
            setStat(values, 0, 'crit_chance_percent_if_book_smash_or_chrono_puncture');
        }
    },
    192: {
        masteryRequired: 1
    },
    193: {
        masteryRequired: 2,
        override: values => {
            setStat(values, 0, 'caught_projectile_increased_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    194: {
        masteryRequired: 2,
        additionalMechanics: [MechanicType.InnerFire],
        additionalClassMechanics: [214, 218]
    },
    195: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'silence_duration');
        }
    },
    196: {
        masteryRequired: 3,
        additionalClassMechanics: [216]
    },
    197: {
        masteryRequired: 3,
        override: values => {
            setStat(values, 0, 'time_lock_chance_on_hit_taken');
        },
        additionalClassMechanics: [215]
    },
    198: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'reconstructed_projectile_increased_damage_mult');
            setAsUpgrade(values, 0);
        }
    },
    199: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'arcane_clone_cooldown_reduction')
        },
        additionalClassMechanics: [218]
    },
    200: {
        masteryRequired: 4,
        override: values => {
            setStat(values, 0, 'elemental_damage');
            allowSynergyToCascade(values, 0);
        },
        additionalClassMechanics: [216]
    },
    201: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'arcane_barrier_increased_radius');
        }
    },
    202: {
        masteryRequired: 5,
        override: values => {
            setStat(values, 0, 'remnant_crit_chance_percent')
        },
        additionalClassMechanics: [217]
    },
    203: {
        masteryRequired: 5,
    },
    204: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Upgrade, 'cooldown_time_add');
            addConstant(values, 0, false, EffectValueValueType.Upgrade, 'cast_by_clone');
        },
        additionalClassMechanics: [218]
    },
    205: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'max_arcane_clone_add');
        },
        additionalClassMechanics: [218]
    },
    206: {
        masteryRequired: 6,
        override: values => {
            synergyMultiply100(values, 0);
            allowSynergyToCascade(values, 0);
        }
    },
    207: {
        masteryRequired: 7,
        additionalClassMechanics: [216]
    },
    208: {
        masteryRequired: 7,
        override: values => {
            setStat(values, 0, 'skill_melee_increased_damage_mult');
            setSource(values, 0, 'reduced_on_melee');
            synergyMultiply100(values, 0);
            allowSynergyToCascade(values, 0);
            setStat(values, 1, 'skill_projectile_increased_damage_mult');
            setSource(values, 1, 'reduced_on_projectile');
            synergyMultiply100(values, 1);
            allowSynergyToCascade(values, 1);
            setStat(values, 2, 'skill_aoe_increased_damage_mult');
            setSource(values, 2, 'reduced_on_area');
            synergyMultiply100(values, 2);
            allowSynergyToCascade(values, 2);
        }
    },
    209: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Stat, 'max_arcane_clone_add');
        },
        additionalClassMechanics: [218]
    },
    210: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'percent_restored_mana_as_arcane_bond_damage');
        },
        additionalClassMechanics: [216]
    },
    211: {
        masteryRequired: 8,
        override: values => {
            setStat(values, 0, 'damage_taken_to_mana');
            // Hack damage type
            values.push(effectValueSynergy(0, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'damage', EffectValueValueType.Upgrade));
        }
    },
    223: {
        masteryRequired: 7,
        order: 90,
        line: 5,
        override: values => {
            setStat(values, 0, 'recast_chance_percent');
            addConstant(values, 1, false, EffectValueValueType.Upgrade, 'recast_is_remnant');
        },
        additionalClassMechanics: [217]
    },
    224: {
        masteryRequired: 8,
    },
    225: {
        masteryRequired: 10,
        additionalClassMechanics: [214, 217, 218]
    },
}

export const DATA_SKILL: GameHeroesData<{ [key: number]: DataSkill }> = {
    0: DATA_SKILL_0,
    1: DATA_SKILL_1,
    2: DATA_SKILL_2
}