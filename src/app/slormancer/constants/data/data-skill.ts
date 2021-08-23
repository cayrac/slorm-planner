import { DataSkill } from '../../model/data/data-skill';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../../model/effect-value';
import { EffectValueType } from '../../model/enum/effect-value-type';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';
import { MechanicType } from '../../model/enum/mechanic-type';
import { SkillCostType } from '../../model/enum/skill-cost-type';
import { GameHeroesData } from '../../model/game/game-save';

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
    }
}

function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push({
        type: EffectValueType.Constant,
        value,
        percent,
        valueType,
        stat
    } as EffectValueConstant)
}

export const DATA_SKILL_0: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_0_0_duration');
            addConstant(values, 2.5, false, EffectValueValueType.AreaOfEffect, 'skill_0_0_aoe');
        },
        additionalClassMechanics: []
    },
    1: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_0_1_aoe');
        },
        additionalClassMechanics: []
    },
    2: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 2);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_0_2_duration');
        },
        additionalClassMechanics: []
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
        },
        additionalClassMechanics: []
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
        },
        additionalClassMechanics: []
    },
    5: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 2);
            setUpgrade(values, 1, 14);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_0_5_duration');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_0_5_max_stack');
        },
        additionalClassMechanics: []
    },
    6: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 7);
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_0_6_magnified_hit_count');
        },
        additionalClassMechanics: []
    },
    7: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
        },
        additionalClassMechanics: []
    },
    8: {
        masteryRequired: null,
        override: values => {
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
        override: values => { },
        additionalClassMechanics: []
    },
    12: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Duration, 'skill_0_12_daze_duration');
        },
        additionalClassMechanics: []
    },
    13: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_13_perfect_skewer_chance');
        },
        additionalClassMechanics: []
    },
    14: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    15: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    16: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_16_perfect_overdrive_chance');
        },
        additionalClassMechanics: []
    },
    17: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_17_perfect_inner_fire_chance');
        },
        additionalClassMechanics: []
    },
    18: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    19: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    20: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_0_20_hold_duration');
        },
        additionalClassMechanics: [],
        costTypeOverride: SkillCostType.Mana
    },
    21: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    22: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_22_perfect_recast_chance');
        },
        additionalClassMechanics: []
    },
    23: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_0_23_buff_attacks_speed');
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_0_23_buff_duration');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_0_23_buff_fortunate_stack_per_hit');
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_0_23_buff_default_stack_per_hit');
        },
        additionalClassMechanics: []
    },
    24: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    25: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    26: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_26_fortunate_pierce_chance');
        },
        additionalClassMechanics: []
    },
    27: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    28: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 6, false, EffectValueValueType.Duration, 'skill_0_28_buff_duration');
            addConstant(values, 10, false, EffectValueValueType.Duration, 'skill_0_28_buff_max_stack');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_0_28_buff_fortunate_stack_on_hit');
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_0_28_buff_default_stack_on_hit');
        },
        additionalClassMechanics: []
    },
    29: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    30: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_30_perfect_astral_retribution_chance');
        },
        additionalClassMechanics: []
    },
    31: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    32: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    33: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Flat, 'skill_0_33_max_mana_cost');
        },
        additionalClassMechanics: []
    },
    34: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_0_34_reduced_min_damage');
        },
        additionalClassMechanics: []
    },
    35: {
        masteryRequired: 8,
        override: values => { },
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
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    39: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 6, false, EffectValueValueType.Flat, 'skill_0_39_perfect_additional_projectiles');
        },
        additionalClassMechanics: []
    },
    40: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.AreaOfEffect, 'skill_0_40_root_aoe');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_0_40_root_duration');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_40_perfect_root_chance');
        },
        additionalClassMechanics: []
    },
    41: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    42: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_mana_cost_reduction_per_bleed');
            addConstant(values, 7, false, EffectValueValueType.AreaOfEffect, 'skill_mana_cost_reduction_per_bleed_distance');
        },
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
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    46: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    47: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_additional_cooldown_per_bleed');
            addConstant(values, 0, false, EffectValueValueType.Flat, 'skill_cooldown_reduction_minimum');
        },
        additionalClassMechanics: []
    },
    48: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_additional_bleed_stack_if_full_life');
        },
        additionalClassMechanics: []
    },
    49: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    50: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_fork_chance');
        },
        additionalClassMechanics: []
    },
    51: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_training_dummy_duration');
        },
        additionalClassMechanics: []
    },
    52: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_overdrive_chance');
        },
        additionalClassMechanics: []
    },
    53: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    54: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    55: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_chance_additional_projectile_count');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_fortunate_chance_additional_projectile');
        },
        additionalClassMechanics: []
    },
    56: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_bleed_apply_aoe');
        },
        additionalClassMechanics: []
    },
    57: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    138: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    139: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    140: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    141: {
        masteryRequired: 2,
        override: () => { },
        additionalClassMechanics: []
    },
    142: {
        masteryRequired: 2,
        override: () => { },
        additionalClassMechanics: []
    },
    143: {
        masteryRequired: 2,
        override: () => { },
        additionalClassMechanics: []
    },
    144: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    145: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    146: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    147: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    148: {
        masteryRequired: 4,
        override: () => { },
        additionalClassMechanics: []
    },
    149: {
        masteryRequired: 4,
        override: () => { },
        additionalClassMechanics: []
    },
    150: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_0_150_stun_duration');
        },
        additionalClassMechanics: []
    },
    151: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_0_151_block_per_second');
        },
        additionalClassMechanics: []
    },
    152: {
        masteryRequired: 5,
        override: () => { },
        additionalClassMechanics: []
    },
    153: {
        masteryRequired: 5,
        override: () => { },
        additionalClassMechanics: []
    },
    154: {
        masteryRequired: 5,
        override: () => { },
        additionalClassMechanics: []
    },
    155: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_0_155_stun_duration');
        },
        additionalClassMechanics: []
    },
    156: {
        masteryRequired: 6,
        override: () => { },
        additionalClassMechanics: []
    },
    157: {
        masteryRequired: 6,
        override: () => { },
        additionalClassMechanics: []
    },
    158: {
        masteryRequired: 7,
        override: () => { },
        additionalClassMechanics: []
    },
    159: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Flat, 'skill_0_159_max_damage_taken_if_source_life_is_full');
        },
        additionalClassMechanics: []
    },
    160: {
        masteryRequired: 7,
        override: () => { },
        additionalClassMechanics: []
    },
    161: {
        masteryRequired: 8,
        override: () => { },
        additionalClassMechanics: [215]
    },
    162: {
        masteryRequired: 8,
        override: () => { },
        additionalClassMechanics: []
    },
    163: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    164: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    165: {
        masteryRequired: 1,
        override: () => { },
        additionalClassMechanics: []
    },
    166: {
        masteryRequired: 2,
        override: () => { },
        additionalClassMechanics: []
    },
    167: {
        masteryRequired: 2,
        override: () => { },
        additionalClassMechanics: [217]
    },
    168: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_0_168_stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_0_168_fortunate_stun_chance');
        },
        additionalClassMechanics: []
    },
    169: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    170: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'inner_fire_lucky');
            addConstant(values, 1, false, EffectValueValueType.Flat, 'overdrive_lucky');
        },
        additionalClassMechanics: []
    },
    171: {
        masteryRequired: 3,
        override: () => { },
        additionalClassMechanics: []
    },
    172: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_0_172_crest_shield_cast');
        },
        additionalClassMechanics: []
    },
    173: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'luck_gained_on_cast');
        },
        additionalClassMechanics: []
    },
    174: {
        masteryRequired: 4,
        override: () => { },
        additionalClassMechanics: []
    },
    175: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'ancestral_strike_lucky');
        },
        additionalClassMechanics: []
    },
    176: {
        masteryRequired: 5,
        override: () => {

        },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    177: {
        masteryRequired: 5,
        override: () => { },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.Overdrive]
    },
    178: {
        masteryRequired: 6,
        override: () => { },
        additionalClassMechanics: []
    },
    179: {
        masteryRequired: 6,
        override: () => { },
        additionalClassMechanics: []
    },
    180: {
        masteryRequired: 6,
        override: () => { },
        additionalClassMechanics: []
    },
    181: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values,3, false, EffectValueValueType.Duration, 'skill_0_181_cooldown');
        },
        additionalClassMechanics: []
    },
    182: {
        masteryRequired: 7,
        override: () => { },
        additionalClassMechanics: []
    },
    183: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 75, false, EffectValueValueType.Flat, 'skill_0_183_low_life_damage_reduction');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'skill_0_183_low_life_treshold');
            addConstant(values, 25, false, EffectValueValueType.Duration, 'skill_0_183_low_life_treshold');
        },
        additionalClassMechanics: []
    },
    184: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Flat, 'astral_retribution_on_support_cast');
        },
        additionalClassMechanics: [217]
    },
    185: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'perfect_cast_additional_projectiles');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'perfect_cast_recast_chance');
        },
        additionalClassMechanics: []
    },
    186: {
        masteryRequired: 8,
        override: values => { },
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
        override: values => { },
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
        override: values => { },
        additionalClassMechanics: []
    },
    193: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Flat, 'default_block_stack_after_block');
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
        override: values => { },
        additionalClassMechanics: []
    },
    197: {
        masteryRequired: 4,
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
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_0_199_counter_per_nullified_hit');
        },
        additionalClassMechanics: []
    },
    200: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    201: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    202: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    203: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_0_203_retaliation_duration');
        },
        additionalClassMechanics: []
    },
    204: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_0_204_buff_duration');
        },
        additionalClassMechanics: []
    },
    205: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, -35, false, EffectValueValueType.Flat, 'movement_speed');
        },
        additionalClassMechanics: []
    },
    206: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'support_area_damage_reduction');
        },
        additionalClassMechanics: []
    },
    207: {
        masteryRequired: 7,
        override: values => { },
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
        override: values => { },
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
    212: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
}

export const DATA_SKILL_1: { [key: number]: DataSkill } = {
    0: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 6);
            addConstant(values, 15, false, EffectValueValueType.Duration, 'skill_1_0_duration');
        },
        additionalClassMechanics: []
    },
    1: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'skill_1_1_evasion_bonus');
        },
        additionalClassMechanics: []
    },
    2: {
        masteryRequired: null,
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_1_2_duration');
        },
        additionalClassMechanics: []
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
        },
        additionalClassMechanics: []
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
            addConstant(values, 1.2, false, EffectValueValueType.AreaOfEffect, 'skill_1_4_aoe');
        },
        additionalClassMechanics: []
    },
    5: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
        },
        additionalClassMechanics: []
    },
    6: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 8);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_1_6_aoe');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_1_6_increased_damage_per_second');
        },
        additionalClassMechanics: []
    },
    7: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 7);
            setUpgrade(values, 1, 20);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_1_7_duration');
        },
        additionalClassMechanics: []
    },
    8: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 3);
            setUpgrade(values, 1, 3);
            addConstant(values, 300, false, EffectValueValueType.Duration, 'skill_1_7_max_charged_increased_damages');
            addConstant(values, 100, false, EffectValueValueType.Duration, 'skill_1_7_max_charged_piece_chances');
        },
        additionalClassMechanics: []
    },
    9: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 8);
            addConstant(values, 50, false, EffectValueValueType.Duration, 'skill_1_9_climax_increased_damages');
        },
        additionalClassMechanics: []
    },
    10: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 7);
            setValue(values, 1, 2);
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_1_10_wait_duration');

            console.log('override : ')
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
        additionalClassMechanics: []
    },
    3: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 2);
        },
        additionalClassMechanics: []
    },
    4: {
        masteryRequired: null,
        override: values => {
            setUpgrade(values, 0, 4);
            setUpgrade(values, 1, 4);
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_2_4_tick_per_second');
        },
        additionalClassMechanics: []
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
    }
}

export const DATA_SKILL: GameHeroesData<{ [key: number]: DataSkill }> = {
    0: DATA_SKILL_0,
    1: DATA_SKILL_1,
    2: DATA_SKILL_2
}