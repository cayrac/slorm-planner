import { DataSkill } from '../../model/data/data-skill';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../../model/effect-value';
import { EffectValueType } from '../../model/enum/effect-value-type';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';

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

export const DATA_SKILL: { [key: number]: DataSkill } = {
    0: {
        override: values => {
            setUpgrade(values, 0, 6);
            addConstant(values, 15, false, EffectValueValueType.Duration, 'skill_0_duration');
        }
    },
    1: {
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'skill_1_evasion_bonus');
        }
    },
    2: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_2_duration');
        }
    },
    3: {
        override: values => {
            setUpgrade(values, 0, 4);
        }
    },
    4: {
        override: values => {
            setUpgrade(values, 0, 3);
            addConstant(values, 1.2, false, EffectValueValueType.AreaOfEffect, 'skill_4_aoe');
        }
    },
    5: {
        override: values => {
            setUpgrade(values, 0, 3);
        }
    },
    6: {
        override: values => {
            setUpgrade(values, 0, 8);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_6_aoe');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_6_increased_damage_per_second');
        }
    },
    7: {
        override: values => {
            setUpgrade(values, 0, 7);
            setUpgrade(values, 1, 20);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_7_duration');
        }
    },
    8: {
        override: values => {
            setUpgrade(values, 0, 3);
            setUpgrade(values, 1, 3);
            addConstant(values, 300, false, EffectValueValueType.Duration, 'skill_7_max_charged_increased_damages');
            addConstant(values, 100, false, EffectValueValueType.Duration, 'skill_7_max_charged_piece_chances');
        }
    },
    9: {
        override: values => {
            setUpgrade(values, 0, 8);
            addConstant(values, 50, false, EffectValueValueType.Duration, 'skill_9_climax_increased_damages');
        }
    },
    10: {
        override: values => {
            setUpgrade(values, 0, 7);
            setValue(values, 1, 2);
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_10_wait_duration');

            console.log('override : ')
        }
    },
}