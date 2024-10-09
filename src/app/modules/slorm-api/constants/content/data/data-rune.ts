import { DataRune } from '../../../model/content/data/data-rune';
import { EffectValueType } from '../../../model/content/enum/effect-value-type';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { Rune } from '../../../model/content/rune';
import { effectValueConstant, effectValueSynergy, effectValueVariable } from '../../../util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable, warnIfEqual } from '../../../util/utils';


function setStat(rune: Rune, index: number, stat: string) {
    const value = rune.values[index]

    if (value) {
        warnIfEqual(value.stat, stat, 'rune setStat at index ' + index + ' did not changed anthing', value);
        value.stat = stat;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setValue(rune: Rune, index: number, newValue: number) {
    const value = rune.values[index]

    if (value) {
        warnIfEqual(value.baseValue, newValue, 'rune setValue at index ' + index + ' did not changed anthing', value);
        value.baseValue = newValue;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setUpgrade(rune: Rune, index: number, upgrade: number) {
    const value = rune.values[index]

    if (value && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        warnIfEqual(value.upgradeType + value.upgrade, upgrade + upgrade, 'rune setUpgrade at index ' + index + ' did not changed anthing', value);
        value.baseUpgrade = upgrade;
        value.upgrade = upgrade;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setUpgradeType(rune: Rune, index: number, upgradeType: EffectValueUpgradeType) {
    const value = rune.values[index]

    if (value && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        warnIfEqual(value.upgradeType, upgradeType, 'rune setUpgradeType at index ' + index + ' did not changed anthing', value);
        value.upgradeType = upgradeType;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setType(rune: Rune, index: number, type: EffectValueType) {
    const value = rune.values[index]

    if (value) {
        warnIfEqual(value.type, type, 'rune setType at index ' + index + ' did not changed anthing', value);
        value.type = type;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setPercent(rune: Rune, index: number, percent: boolean) {
    const value = rune.values[index]

    if (value) {
        warnIfEqual(value.percent, percent, 'rune setPercent at index ' + index + ' did not changed anthing', value);
        value.percent = percent;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setSource(rune: Rune, index: number, source: string) {
    const value = rune.values[index]

    if (value && isEffectValueSynergy(value)) {
        warnIfEqual(value.source, source, 'rune setSource at index ' + index + ' did not changed anthing', value);
        value.source = source;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function allowSynergyToCascade(rune: Rune, index: number) {
    const value = rune.values[index];

    if (value && isEffectValueSynergy(value)) {
        warnIfEqual(value.cascadeSynergy, true, 'rune allowSynergyToCascade at index ' + index + ' did not changed anthing', rune);
        value.cascadeSynergy = true;
    } else {
        throw new Error('failed to change rune synergy cascade at index ' + index);
    }
}

function addConstant(rune: Rune, value: number, stat: string, valueType: EffectValueValueType) {
    rune.values.push(effectValueConstant(value, false, stat, valueType));
}

function addVariable(rune: Rune, value: number, upgrade: number, stat: string, valueType: EffectValueValueType, percent: boolean = true) {
    rune.values.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.RuneLevel, percent, stat, valueType));
}

function addSynergy(rune: Rune, value: number, upgrade: number, source: string, stat: string) {
    rune.values.push(effectValueSynergy(value, upgrade, EffectValueUpgradeType.RuneLevel, false, source, stat, EffectValueValueType.Damage));
}

export const DATA_RUNE: { [key: number]: DataRune } = {
    0: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
        }
    },
    1: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
        }
    },
    2: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
            setStat(rune, 1, 'garbage_stat');
        }
    },
    3: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
        }
    },
    4: {
        override: rune => {
            setStat(rune, 0, 'trigger_effect_rune_cooldown_reduction');
        }
    },
    5: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
            setStat(rune, 1, 'garbage_stat');
        }
    },
    6: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
        }
    },
    8: {
        override: rune => {
            setType(rune, 0, EffectValueType.Variable);
            setPercent(rune, 0, true);
            rune.values[1] = effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', undefined, undefined, undefined, undefined, undefined, undefined, true);
            addConstant(rune, 1.5, 'garbage_stat', EffectValueValueType.AreaOfEffect);
            addVariable(rune, 20, 3, 'firework_trigger_chance', EffectValueValueType.Stat);
        }
    },
    10: {
        override: rune => {
            setStat(rune, 4, 'primary_skill_increased_damage');
        }
    },
    11: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
            setStat(rune, 1, 'unrelenting_stacks_max');
            setStat(rune, 2, 'unrelenting_stack_retaliate_percent');
        }
    },
    12: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
            allowSynergyToCascade(rune, 0);
            setStat(rune, 1, 'garbage_stat');
                allowSynergyToCascade(rune, 1);
        }
    },
    13: {
        override: rune => {
            setStat(rune, 1, 'elemental_damage');
            allowSynergyToCascade(rune, 1);
            rune.values[1] = effectValueVariable(10, 5, EffectValueUpgradeType.RuneLevel, true, 'afflict_chance');
            setType(rune, 2, EffectValueType.Variable);
            setStat(rune, 2, 'afflict_duration');
            rune.values[3] = effectValueSynergy(75, 0, EffectValueUpgradeType.RuneLevel, false, 'current_mana', 'elemental_damage', undefined, undefined, undefined, undefined, undefined, undefined, true);

            setUpgrade(rune, 1, 5);

            
            setValue(rune, 1, 10);
        }
    },
    14: {
        override: rune => {
            setStat(rune, 0, 'ultimatum_increased_effect');
        }
    },
    15: {
        override: rune => {
            setStat(rune, 0, 'physical_damage');
            allowSynergyToCascade(rune, 0);
            setStat(rune, 1, 'elemental_damage');
            allowSynergyToCascade(rune, 1);
            setValue(rune, 1, 50);
            rune.values[2] = effectValueVariable(50, 0, EffectValueUpgradeType.RuneLevel, true, 'alpha_omega_mana_treshold');
            rune.values[3] = effectValueVariable(75, 0, EffectValueUpgradeType.RuneLevel, true, 'alpha_omega_increased_damage');
            rune.values[4] = effectValueVariable(0, 5, EffectValueUpgradeType.RuneLevel, true, 'alpha_omega_increased_size');
        }
    },
    16: {
        override: rune => {
            setValue(rune, 0, 0);
            setUpgrade(rune, 0, 5000);
            setPercent(rune, 0, false);
            setType(rune, 0, EffectValueType.Variable);
            addSynergy(rune, 100, 0, 'victims_current_reaper', 'elemental_damage')
        }
    },
    17: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
            setStat(rune, 1, 'prime_totem_shoot_count');
            setStat(rune, 2, 'prime_totem_duration');
        }
    },
    18: {
        override: rune => {
            setValue(rune, 0, 200);
            setValue(rune, 1, 10);
            setUpgrade(rune, 1, 0);
            setSource(rune, 0, 'weapon_damage');
            setUpgrade(rune, 0, 0);
            addVariable(rune, 5, 1, 'mana_harvest_duration', EffectValueValueType.Duration, false);
            addConstant(rune, 1.5, 'garbage_stat', EffectValueValueType.AreaOfEffect);
        }
    },
    19: {
        override: rune => {
            setStat(rune, 1, 'cooldown_reduction_per_walk');
            setStat(rune, 2, 'cooldown_reduction_per_walk_distance');
        }
    },
    20: {
        override: rune => {
            rune.values.unshift(effectValueVariable(1, 1, EffectValueUpgradeType.Every5RuneLevel, false, 'max_skeleton_count'));
            setValue(rune, 1, 40);
            setUpgrade(rune, 1, 0);
        }
    },
    21: {
        override: rune => {
            setType(rune, 0, EffectValueType.Variable);
            setStat(rune, 0, 'effect_rune_reduced_power');
            setPercent(rune, 0, true);
            addSynergy(rune, 100, 0, 'rune_affinity', 'enhancement_rune_increased_effect');
        }
    },
    22: {
        override: rune => {
            setStat(rune, 0, 'effect_rune_trigger_chance');
            setStat(rune, 1, 'garbage_stat');
        }
    },
    23: {
        override: rune => {
            setStat(rune, 0, 'effect_rune_increased_effect_per_effective_rune_stack');
            setStat(rune, 1, 'effect_rune_increased_effect_per_effective_rune_stack_max');
        }
    },
    24: {
        override: rune => {
            setUpgradeType(rune, 1, EffectValueUpgradeType.RuneLevel);
            setStat(rune, 0, 'enhancement_rune_stack_max');
            setStat(rune, 1, 'effect_rune_duration_increased_per_enhancement_rune_stack');
            setStat(rune, 2, 'garbage_stat');
            setUpgradeType(rune, 2, EffectValueUpgradeType.RuneLevel);
        }
    },
    25: {
        override: rune => {
            setUpgradeType(rune, 1, EffectValueUpgradeType.RuneLevel);
            setStat(rune, 0, 'garbage_stat');
            setStat(rune, 1, 'rune_power_override');
        }
    },
    26: {
        override: rune => {
            setStat(rune, 0, 'garbage_stat');
        }
    },
    27: {
        override: rune => {
            setStat(rune, 0, 'effect_rune_increased_effect');
            setStat(rune, 1, 'effect_rune_increased_power');
        }
    }
}