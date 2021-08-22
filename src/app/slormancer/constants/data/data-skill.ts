import { DataSkill } from '../../model/data/data-skill';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../../model/effect-value';
import { EffectValueType } from '../../model/enum/effect-value-type';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';
import { MechanicType } from '../../model/enum/mechanic-type';
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
        override: values => { 
        },
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