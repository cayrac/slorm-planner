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
    58: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_silence_duration');
            addConstant(values, 100, false, EffectValueValueType.AreaOfEffect, 'skill_fortunate_silence_chance');
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
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    62: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    63: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    64: {
        masteryRequired: 4,
        override: values => { },
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
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_magnified_count_on_other_skill_cast');
        },
        additionalClassMechanics: []
    },
    68: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_chance_cast_whirlwing_on_cast');
        },
        additionalClassMechanics: []
    },
    69: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    70: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_perfect_recast_multiplier');
        },
        additionalClassMechanics: []
    },
    71: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    72: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_beat_stack_trigger');
            addConstant(values, 3, false, EffectValueValueType.Flat, 'skill_beat_trigger_astral_retribution_count');
        },
        additionalClassMechanics: []
    },
    73: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 0, false, EffectValueValueType.Duration, 'skill_perfect_cast_cooldown');
        },
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
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    78: {
        masteryRequired: 4,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.AreaOfEffect, 'skill_mass_hook_distance');
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_damage_reduction');
        },
        additionalClassMechanics: []
    },
    79: {
        masteryRequired: 4,
        override: values =>  { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_increased_cost_percent_per_controlled_enemy');
        },
        additionalClassMechanics: []
    },
    80: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    81: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_melee_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_projectile_defense_stack_reduction');
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_aoe_defense_stack_reduction');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_max_defense_stack');
        },
        additionalClassMechanics: []
    },
    82: {
        masteryRequired: 7,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_stun_aoe');
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_stun_duration');
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_fortunate_stun_chance');
        },
        additionalClassMechanics: []
    },
    83: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    84: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 8, false, EffectValueValueType.Flat, 'skill_blind_duration');
        },
        additionalClassMechanics: []
    },
    85: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_vitality_stack_duration');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_max_vitality_stack');
        },
        additionalClassMechanics: []
    },
    86: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_earthquake_duration');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_earthquake_aoe');
        },
        additionalClassMechanics: []
    },
    87: {
        masteryRequired: 10,
        override: values =>  { 
            addConstant(values, 1000, false, EffectValueValueType.Flat, 'skill_increased_cost_percent_per_controlled_elite');
        },
        additionalClassMechanics: []
    },
    88: {
        masteryRequired: 2,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    89: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_increased_cost_percent');
        },
        additionalClassMechanics: []
    },
    90: {
        masteryRequired: 2,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    91: {
        masteryRequired: 2,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_fortunate_broken_armor_chance');
        },
        additionalClassMechanics: []
    },
    92: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_inner_fire_chance');
        },
        additionalClassMechanics: []
    },
    93: {
        masteryRequired: 4,
        override: values =>  {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_slow_duration');
        },
        additionalClassMechanics: []
    },
    94: {
        masteryRequired: 4,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    95: {
        masteryRequired: 5,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    96: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_block_stack_per_second');
        },
        additionalClassMechanics: []
    },
    97: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_astral_retribution_on_hit');
        },
        additionalClassMechanics: []
    },
    98: {
        masteryRequired: 6,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    99: {
        masteryRequired: 7,
        override: values =>  { 
        },
        additionalClassMechanics: []
    },
    100: {
        masteryRequired: 8,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_perfect_duplicate_chance');
        },
        additionalClassMechanics: []
    },
    101: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_perfect_multicast_count');
        },
        additionalClassMechanics: []
    },
    102: {
        masteryRequired: 9,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_multicast_count');
            addConstant(values, 40, false, EffectValueValueType.Flat, 'skill_damage_reduction');
        },
        additionalClassMechanics: []
    },
    103: {
        masteryRequired: 10,
        override: values =>  { 
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
    11: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    12: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    13: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    14: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    15: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    16: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    17: {
        masteryRequired: 5,
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
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_rebound_before_hit_increased_damage_first_hit');
        },
        additionalClassMechanics: []
    },
    20: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    21: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    22: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    23: {
        masteryRequired: 8,
        override: values => { },
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
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    27: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    28: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    29: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    30: {
        masteryRequired: 3,
        override: values => { },
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
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    34: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    35: {
        masteryRequired: 6,
        override: values => { 
            addConstant(values, -25, false, EffectValueValueType.Flat, 'skill_increased_aoe_size');
        },
        additionalClassMechanics: []
    },
    36: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    37: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Duration, 'skill_slow_duration');
        },
        additionalClassMechanics: []
    },
    38: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    39: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    40: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    41: {
        masteryRequired: 10,
        override: values => { 
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_delightful_rain_stack_increased_attack_speed');
            addConstant(values, 25, false, EffectValueValueType.Flat, 'skill_delightful_rain_stack_maximum');
        },
        additionalClassMechanics: []
    },
    42: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    43: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_next_stab_buff_ancestral_strike_chance');
            addConstant(values, 2, false, EffectValueValueType.Duration, 'skill_next_stab_buff_duration');
        },
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
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_daze_duration');
        },
        additionalClassMechanics: []
    },
    47: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    48: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    49: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    50: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    51: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    52: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    53: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    54: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    55: {
        masteryRequired: 9,
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
        override: values => { },
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
        override: values => { },
        additionalClassMechanics: []
    },
    63: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    64: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    65: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_ragenous_dagger_spawn_on_first_hit');
        },
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
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    70: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    71: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_homing_bolt_aoe');
        },
        additionalClassMechanics: []
    },
    72: {
        masteryRequired: 10,
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
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    78: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    79: {
        masteryRequired: 4,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_movement_speed_per_affected_ennemie');
        },
        additionalClassMechanics: []
    },
    80: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    81: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    82: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    83: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_explosion_aoe');
        },
        additionalClassMechanics: []
    },
    84: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    85: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    86: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    87: {
        masteryRequired: 9,
        override: values => {
            addConstant(values, 30, false, EffectValueValueType.Flat, 'skill_increased_damage_per_stack');
        },
        additionalClassMechanics: []
    },
    88: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    89: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_full_charge_rebounce_chance');
        },
        additionalClassMechanics: []
    },
    90: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    91: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    92: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    93: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    94: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    95: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    96: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    97: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    98: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    99: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    100: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    101: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    102: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    103: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    104: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    105: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    106: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    107: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 0, false, EffectValueValueType.Flat, 'skill_tormented_cost_and_cooldown');
        },
        additionalClassMechanics: []
    },
    108: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    109: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    110: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    111: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    112: {
        masteryRequired: 6,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_blind_aoe');
        },
        additionalClassMechanics: []
    },
    113: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    114: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    115: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_overdrive_trigger_count')
        },
        additionalClassMechanics: []
    },
    116: {
        masteryRequired: 9,
        override: values => { },
        additionalClassMechanics: []
    },
    117: {
        masteryRequired: 10,
        override: values => { },
        additionalClassMechanics: []
    },
    118: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 4, false, EffectValueValueType.AreaOfEffect, 'skill_wandering_arrow_range');
        },
        additionalClassMechanics: []
    },
    119: {
        masteryRequired: 2,
        override: values => {
        },
        additionalClassMechanics: []
    },
    120: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    121: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    122: {
        masteryRequired: 3,
        override: values => {
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_ancestral_strike_chance_per_yard');
        },
        additionalClassMechanics: []
    },
    123: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    124: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    125: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    126: {
        masteryRequired: 5,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_serenity_per_completed_instruction');
        },
        additionalClassMechanics: []
    },
    127: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    128: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    129: {
        masteryRequired: 7,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_critical_strike_chance_per_traveled_yard');
        },
        additionalClassMechanics: []
    },
    130: {
        masteryRequired: 8,
        override: values => {
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_buff_increased_attack_speed_per_return_hit');
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
            addConstant(values, 1, false, EffectValueValueType.Flat, 'skill_impatient_arrow_stack_per_second');
            addConstant(values, 5, false, EffectValueValueType.Flat, 'skill_shockwave_chance_per_impatient_arrow_stack');
            addConstant(values, 1, false, EffectValueValueType.AreaOfEffect, 'skill_shockwave_aoe');
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
        override: values => { },
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
        override: values => { },
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
        override: values => { },
        additionalClassMechanics: []
    },
    141: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    142: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    143: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    144: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    145: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    146: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    147: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    148: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_light_arrow_additional_pierce_chance');
        },
        additionalClassMechanics: []
    },
    149: {
        masteryRequired: 6,
        override: values => { },
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
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_ballistas_shared_projectile_modifiers_aoe');
        },
        additionalClassMechanics: []
    },
    152: {
        masteryRequired: 6,
        override: values => { },
        additionalClassMechanics: []
    },
    153: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    154: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    155: {
        masteryRequired: 7,
        override: values => { },
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
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_isolated_aoe');
        },
        additionalClassMechanics: []
    },
    159: {
        masteryRequired: 1,
        override: values => { },
        additionalClassMechanics: []
    },
    160: {
        masteryRequired: 2,
        override: values => { },
        additionalClassMechanics: []
    },
    161: {
        masteryRequired: 2,
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_close_aoe');
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
        override: values => { },
        additionalClassMechanics: []
    },
    164: {
        masteryRequired: 3,
        override: values => { 
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_tormented_delighted_buff_disabled_duration');
        },
        additionalClassMechanics: []
    },
    165: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    166: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    167: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    168: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    169: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    170: {
        masteryRequired: 4,
        override: values => { },
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
        override: values => { },
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
        override: values => { },
        additionalClassMechanics: []
    },
    177: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    178: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    179: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    180: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    181: {
        masteryRequired: 8,
        override: values => { },
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
        override: values => { },
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
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_idle_armor_penetration');
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
        override: values => { },
        additionalClassMechanics: []
    },
    189: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    190: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    191: {
        masteryRequired: 3,
        override: values => { },
        additionalClassMechanics: []
    },
    192: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    193: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    194: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    195: {
        masteryRequired: 4,
        override: values => { },
        additionalClassMechanics: []
    },
    196: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    197: {
        masteryRequired: 5,
        override: values => { 
            addConstant(values, 5, false, EffectValueValueType.AreaOfEffect, 'skill_poison_damage_per_poisoned_enemy_aoe');
        },
        additionalClassMechanics: []
    },
    198: {
        masteryRequired: 5,
        override: values => { },
        additionalClassMechanics: []
    },
    199: {
        masteryRequired: 6,
        override: values => { },
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
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_screen_stun_aoe');
        },
        additionalClassMechanics: []
    },
    202: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: [],
        additionalMechanics: [MechanicType.InnerFire]
    },
    203: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    204: {
        masteryRequired: 7,
        override: values => { },
        additionalClassMechanics: []
    },
    205: {
        masteryRequired: 8,
        override: values => { },
        additionalClassMechanics: []
    },
    206: {
        masteryRequired: 8,
        override: values => { },
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