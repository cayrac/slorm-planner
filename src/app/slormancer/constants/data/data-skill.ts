import { DataSkill } from '../../model/data/data-skill';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../../model/effect-value';
import { EffectValueType } from '../../model/enum/effect-value-type';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';
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
        override: values => {
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_0_0_duration');
            addConstant(values, 2.5, false, EffectValueValueType.AreaOfEffect, 'skill_0_0_aoe');
        }
    },
    1: {
        override: values => {
            setUpgrade(values, 0, 4);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_0_1_aoe');
        }
    },
    2: {
        override: values => {
            setUpgrade(values, 0, 2);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_0_2_duration');
        }
    },
    3: {
        override: values => {
            setUpgrade(values, 0, 4);
        }
    },
    4: {
        override: values => {
            setUpgrade(values, 0, 5);
        }
    },
    5: {
        override: values => {
            setUpgrade(values, 0, 2);
            setUpgrade(values, 1, 14);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_0_5_duration');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_0_5_max_stack');
        }
    },
    6: {
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 7);
            addConstant(values, 8, false, EffectValueValueType.Duration, 'skill_0_6_magnified_hit_count');
        }
    },
    7: {
        override: values => {
            setUpgrade(values, 0, 6);
        }
    },
    8: {
        override: values => {
            setUpgrade(values, 0, 6);
        }
    },
    9: {
        override: values => {
            setUpgrade(values, 0, 2);
        }
    },
    10: {
        override: values => {
            setUpgrade(values, 1, 7);
        }
    }
}

export const DATA_SKILL_1: { [key: number]: DataSkill } = {
    0: {
        override: values => {
            setUpgrade(values, 0, 6);
            addConstant(values, 15, false, EffectValueValueType.Duration, 'skill_1_0_duration');
        }
    },
    1: {
        override: values => {
            addConstant(values, 50, false, EffectValueValueType.Stat, 'skill_1_1_evasion_bonus');
        }
    },
    2: {
        override: values => {
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_1_2_duration');
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
            addConstant(values, 1.2, false, EffectValueValueType.AreaOfEffect, 'skill_1_4_aoe');
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
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_1_6_aoe');
            addConstant(values, 10, false, EffectValueValueType.Flat, 'skill_1_6_increased_damage_per_second');
        }
    },
    7: {
        override: values => {
            setUpgrade(values, 0, 7);
            setUpgrade(values, 1, 20);
            addConstant(values, 3, false, EffectValueValueType.Duration, 'skill_1_7_duration');
        }
    },
    8: {
        override: values => {
            setUpgrade(values, 0, 3);
            setUpgrade(values, 1, 3);
            addConstant(values, 300, false, EffectValueValueType.Duration, 'skill_1_7_max_charged_increased_damages');
            addConstant(values, 100, false, EffectValueValueType.Duration, 'skill_1_7_max_charged_piece_chances');
        }
    },
    9: {
        override: values => {
            setUpgrade(values, 0, 8);
            addConstant(values, 50, false, EffectValueValueType.Duration, 'skill_1_9_climax_increased_damages');
        }
    },
    10: {
        override: values => {
            setUpgrade(values, 0, 7);
            setValue(values, 1, 2);
            addConstant(values, 1, false, EffectValueValueType.Duration, 'skill_1_10_wait_duration');

            console.log('override : ')
        }
    },
}

export const DATA_SKILL_2: { [key: number]: DataSkill } = {
    0: {
        override: values => {
            addConstant(values, 40, false, EffectValueValueType.Flat, 'skill_2_0_slow_percent');
            addConstant(values, 6, false, EffectValueValueType.Duration, 'skill_2_0_slow_duration');
            addConstant(values, -90, false, EffectValueValueType.Flat, 'skill_2_0_projectile_slow');
        }
    },
    3: {
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 2);
        }
    },
    4: {
        override: values => {
            setUpgrade(values, 0, 4);
            setUpgrade(values, 1, 4);
            addConstant(values, 4, false, EffectValueValueType.Flat, 'skill_2_4_tick_per_second');
        }
    },
    5: {
        override: values => {
            setUpgrade(values, 0, 15);
        }
    },
    6: {
        override: values => {
            setUpgrade(values, 0, 3);
            setUpgrade(values, 1, 8);
            addConstant(values, 1.5, false, EffectValueValueType.AreaOfEffect, 'skill_2_6_aoe');
        }
    },
    7: {
        override: values => {
            addConstant(values, 5000, false, EffectValueValueType.Flat, 'skill_2_7_remnant_increased_damages');
            addConstant(values, 50, false, EffectValueValueType.Flat, 'skill_2_7_remnant_base_damages');
        }
    },
    8: {
        override: values => {
            setUpgrade(values, 0, 4);
            setUpgrade(values, 1, 2);
        }
    },
    9: {
        override: values => {
            setUpgrade(values, 0, 3);
            addConstant(values, 7, false, EffectValueValueType.Duration, 'skill_2_9_duration');
            addConstant(values, 2, false, EffectValueValueType.AreaOfEffect, 'skill_2_9_aoe');
            addConstant(values, 2, false, EffectValueValueType.Flat, 'skill_2_9_tick_per_second');
        }
    },
    10: {
        override: values => {
            setUpgrade(values, 0, 5);
            setUpgrade(values, 1, 5);
            addConstant(values, 100, false, EffectValueValueType.Flat, 'skill_2_10_pierce_chance');
        }
    }
}

export const DATA_SKILL: GameHeroesData<{ [key: number]: DataSkill }> = {
    0: DATA_SKILL_0,
    1: DATA_SKILL_1,
    2: DATA_SKILL_2
}