import { DataReaper } from '../../../model/content/data/data-reaper';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { ReaperEffect } from '../../../model/content/reaper-effect';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import { isEffectValueConstant, isEffectValueSynergy, isEffectValueVariable, valueOrNull } from '../../../util/utils';

function overrideValueTypeAndStat(effect: ReaperEffect | null, index: number, valueType: EffectValueValueType, stat: string) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null) {
        value.valueType = valueType;
        if (stat !== null) {
            value.stat = stat;
        }
    } else {
        throw new Error('failed to override effect value at index ' + index + ' with : ' + valueType + ' / ' + stat);
    }
}

function overrideSynergySource(effect: ReaperEffect | null, index: number, source: string) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null && isEffectValueSynergy(value)) {
        value.source = source;
    } else {
        throw new Error('failed to override synergy source at index ' + index + ' with : ' + source);
    }
}

function overrideSynergyPercent(effect: ReaperEffect | null, index: number, percent: boolean) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null && isEffectValueSynergy(value)) {
        value.percent = percent;
    } else {
        throw new Error('failed to override synergy percent at index ' + index + ' with : ' + percent);
    }
}

function negateValueBaseAndUpgrade(effect: ReaperEffect | null, index: number) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null && isEffectValueVariable(value)) {
        value.baseValue = value.baseValue * -1;
        value.upgrade = value.upgrade * -1;
    } else {
        throw new Error('failed to negate effect value at index ' + index);
    }
}

function changeValue(effect: ReaperEffect | null, index: number, newValue: number) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        value.baseValue = newValue;
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}

function synergyMultiply100(effect: ReaperEffect | null, index: number) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null;

    if (value !== null && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        value.baseValue = value.baseValue * 100;
    } else {
        throw new Error('failed to change value for effect value at index ' + index);
    }
}

function addConstant(effect: ReaperEffect | null, value: number, percent: boolean, valueType: EffectValueValueType, stat: string) {
    if (effect !== null) {
        effect.values.push(effectValueConstant(value, percent, stat, valueType))
    } else {
        throw new Error('failed to add effect value with : ' + value + ' / ' + percent + ' / ' + valueType + ' / ' + stat);
    }
}

function moveValue(source: ReaperEffect | null, index: number, target: ReaperEffect | null) {

    if (source !== null && target !== null) {
        const [removed] = source.values.splice(index, 1);

        if (removed) {
            target.values.push(removed);
        } else {
            throw new Error('no effect to move found at index ' + index);
        }
    } else {
        throw new Error('failed to move effect value at index ' + index);
    }
}

function duplicateSynergy(source: ReaperEffect | null, index: number, stat: string) {

    if (source !== null) {
        const synergy = source.values[index];

        if (synergy && isEffectValueSynergy(synergy)) {
            source.values.push(effectValueSynergy(synergy.baseValue, synergy.upgrade, synergy.upgradeType, synergy.percent, synergy.source, stat, synergy.valueType, synergy.max));
        } else {
            throw new Error('no synergy to duplicate found at index ' + index);
        }
    } else {
        throw new Error('failed to duplicate synergy at index ' + index);
    }
}

function duplicateVariableAsSynergy(effect: ReaperEffect | null, index: number, type: EffectValueValueType, source: string, stat: string) {

    if (effect !== null) {
        const value = effect.values[index];

        if (value && (isEffectValueVariable(value) || isEffectValueConstant(value))) {
            effect.values.push(effectValueSynergy(value.baseValue, 'upgrade' in value ? value.upgrade : 0, 'upgradeType' in value ? value.upgradeType : EffectValueUpgradeType.None, value.percent, source, stat, type, value.max));
        } else {
            throw new Error('no value to duplicate found at index ' + index);
        }
    } else {
        throw new Error('failed to duplicate variable at index ' + index);
    }
}

function setSynergyAllowMinMax(effect: ReaperEffect | null, index: number, allowMinMax: boolean) {
    if (effect !== null) {
        const value = effect.values[index];
    
        if (value && isEffectValueSynergy(value)) {
            value.allowMinMax = allowMinMax;
        } else {
            throw new Error('failed to update allowMinMax at index ' + index);
        }
    } else {
        throw new Error('failed to duplicate variable at index ' + index);
    }
}

function setSynergyPrecision(effect: ReaperEffect | null, index: number, precision: number) {
    if (effect !== null) {
        const value = effect.values[index];
    
        if (value && isEffectValueSynergy(value)) {
            value.precision = precision;
        } else {
            throw new Error('failed to update precision at index ' + index);
        }
    } else {
        throw new Error('failed to duplicate variable at index ' + index);
    }
}

export const DATA_REAPER: { [key: number]: DataReaper } = {
    1: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'health_restored_on_breach_close');
        }
    },
    2: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'adam_blessing_buff_cooldown_reduction_global_mult');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Duration, 'adam_blessing_buff_duration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'adam_blessing_buff_duration_per_monster');
        }
    },
    3: {
        override: (ba, be, ma) => {
            synergyMultiply100(ba, 1);
            synergyMultiply100(ba, 2);
            synergyMultiply100(be, 2);
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'trainee_reaper_effect_chance');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'trainee_reaper_effect_additional_damage');
            overrideSynergySource(ba, 2, 'xp_find');
        }
    },
    6: {
        override: (ba, be, ma) => {
            moveValue(ba, 3, be);
            synergyMultiply100(be, 1);
            addConstant(ba, 1, false, EffectValueValueType.Stat, 'skill_damage_lucky');
            addConstant(ma, 1, false, EffectValueValueType.Stat, 'cannot_imbue_skills');
        }
    },
    22: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'aoe_increased_size_multiplier_mana_harvest');
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'garbage_stat');
            moveValue(ba, 3, be);
        }
    },
    23: {
        override: (ba, be, ma) => {
            overrideSynergySource(ba, 2, 'weapon_damage');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'inner_fire_damage_add_extra');
            setSynergyAllowMinMax(ba, 2, false);
            setSynergyPrecision(ba, 2, 0);
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'inner_fire_duration_add');
            addConstant(ma, 1, false, EffectValueValueType.Stat, 'reaper_added_to_inner_fire');
        }
    },
    40: {
        override: (ba, be, ma, reaperId) => {
            // peut être mal compris comment parser les stats ?
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'thornbite_reaper_buff_idle_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'thorns_global_mult');

            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Stat, 'thornbite_reaper_buff_cooldown');
            overrideValueTypeAndStat(ba, 6, EffectValueValueType.Stat, 'idle_shield');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Duration, 'thornbite_reaper_benediction_buff_idle_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'idle_thorn_crit_chance_global_mult');
            overrideValueTypeAndStat(be, 2, EffectValueValueType.Stat, 'thorn_crit_chance_percent');
            synergyMultiply100(be, 2);
            overrideSynergySource(be, 2, 'critical_chance');

            addConstant(ma, 1, false, EffectValueValueType.Stat, 'non_thorn_cannot_crit');

            if (reaperId === 41) {
                duplicateSynergy(ba, 6, 'thorns_add');
            }
        }
    },
    41: {
        override: (ba, be, ma) => { 
        }
    },
    46: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'ferocious_affinity_reaper_afflict_chance');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'ferocious_affinity_reaper_afflict_duration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 6, EffectValueValueType.Stat, 'min_basic_damage_add');
            overrideValueTypeAndStat(ba, 7, EffectValueValueType.Damage, 'elemental_damage');
            
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'min_elemental_damage_add');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'mana_consumed_percent_on_skill_cast');
        }
    },
    54: {
        override: (ba, be, ma) => {
            moveValue(ba, 0, be);
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'weapon_damage_mult');
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'elemental_damage_global_mult');
        }
    },
    60: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'projectile_weapon_damage_mult');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'projectile_armor_penetration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'projectile_elemental_penetration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'idle_duration');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'idle_additional_projectile_add');
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'idle_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'idle_additional_projectile_global_mult');
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'not_idle_additional_projectile_global_mult');

            
        }
    },
    61: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'additional_damage_add');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'no_gold_armor_buff_increased_damage_taken_mult');
        }
    },
    62: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Unknown, 'garbage_stat');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'thorns_percent');
            synergyMultiply100(ba, 1);
        }
    },
    65: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Unknown, 'garbage_stat');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'vindictive_slam_reaper_effect_chance');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Damage, 'elemental_damage');
            addConstant(ba, 2, false, EffectValueValueType.AreaOfEffect, 'vindictive_slam_reaper_effect_radius');
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Duration, 'vindictive_slam_reaper_benediction_effect_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Damage, 'elemental_damage');
            addConstant(be, 1, false, EffectValueValueType.Stat, 'reaper_added_to_elements');
            addConstant(ma, -100, false, EffectValueValueType.Stat, 'basic_damage_global_mult');
        }
    },
    66: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Unknown, 'garbage_stat');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Unknown, 'garbage_stat');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'vindictive_slam_reaper_effect_radius_mult');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'vindictive_slam_reaper_effect_elemental_damage_mult');
        }
    },
    67: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Duration, 'vindictive_slam_reaper_effect_stun_duration');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Duration, 'vindictive_slam_reaper_effect_stun_chance');
            synergyMultiply100(ba, 1);
        }
    },
    73: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'mana_skill_as_life_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'mana_restored_percent_on_hit_taken');
            moveValue(ba, 3, be);
            moveValue(ba, 3, be);
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'primary_skill_additional_damages');
            overrideValueTypeAndStat(be, 2, EffectValueValueType.Stat, 'the_max_health_add');
        }
    },
    74: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'mana_regen_add');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'min_basic_damage_add');

            addConstant(be, 1, false, EffectValueValueType.AreaOfEffect, 'manabender_buff_detonation_radius');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'life_percent_removed_on_cast');
            
            duplicateVariableAsSynergy(ba, 1, EffectValueValueType.Stat, 'mana_cost', 'primary_secondary_skill_additional_damage')
        }
    },
    75: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'nimble_buff_crit_damage_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'nimble_buff_brut_damage_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'nimble_buff_crit_chance_percent');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'nimble_buff_brut_chance_percent');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'nimble_buff_primary_skill_increased_damages');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Duration, 'nimble_buff_disable_duration');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'nimble_champion_percent');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Duration, 'nimble_champion_disable_duration');
            addConstant(be, 100, false, EffectValueValueType.Stat, 'nimble_champion_max_stacks');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Duration, 'nimble_champion_lock_duration');

        }
    },
    78: {
        override: (ba, be, ma, reaperId) => {
            if (reaperId === 78 || reaperId === 79) {
                negateValueBaseAndUpgrade(ba, 0);
                negateValueBaseAndUpgrade(ba, 1);
            }
            
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'exhaustion_max_life_as_damage_percent');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'min_cooldown_time');

        }
    },
    79: {
        override: (ba, be, ma, reaperId) => {
            if (reaperId === 79) {
                negateValueBaseAndUpgrade(ba, 0);
            }
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'elemental_damage_percent_for_each_negative_effect_on_ennemies');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'elemental_damage_percent_for_each_negative_effect_on_ennemies_radius');
        }
    },
    80: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Unknown, 'garbage_stat');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Damage, 'elemental_damage');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'exhaustion_duration');
            overrideSynergySource(ba, 2, 'movement_speed');
            synergyMultiply100(ba,2);
        }
    },
    81: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'power_crystal_count');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Damage, 'elemental_damage');
            addConstant(be, 1, false, EffectValueValueType.Stat, 'reaper_added_to_elements');

            if (reaperId === 82 && ba !== null) {
                changeValue(ba, 1, 2);
            } else if (reaperId === 83 && ba !== null) {
                changeValue(ba, 1, 3);
            }

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'power_crystal_additional_projectile_add');
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'primary_secondary_skill_increased_damage_mult');
        }
    },
    82: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'ancestral_legacy_stack_brut_chance_percent');
        }
    },
    83: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Duration, 'elemental_fervor_buff_duration');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'elemental_fervor_buff_elemental_damage_global_mult');
            overrideSynergySource(ba, 1, 'critical_chance');
            overrideSynergyPercent(ba, 1, true);
            synergyMultiply100(ba, 1);
        }
    },
    98: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'overdrive_chance_percent_on_critical_strike');

            addConstant(be, 1, true, EffectValueValueType.Stat, 'overdrive_damage_based_on_skill_damage')
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'melee_skill_increased_damage_mult')
        }
    },
    104: {
        override: (ba, be, ma, reaperId) => {
            addConstant(ma, 1, true, EffectValueValueType.Stat, 'disable_greater_traits')
        }
    },
    111: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'slormbane_reaper_addition_damage_slorm_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Damage, 'primary_secondary_skill_additional_damage');
            synergyMultiply100(ba, 3);
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'health_recovery_mult')
        }
    },
    112: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'goldscourge_reaper_addition_damage_gold_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Damage, 'primary_secondary_skill_additional_damage');
            synergyMultiply100(ba, 3);
            moveValue(ba, 4, be);

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'golden_overdrive_damage_percent');
            overrideSynergySource(be, 0, 'gold_find');
            synergyMultiply100(be, 0);

            addConstant(ma, 1, false, EffectValueValueType.Stat, 'overdrive_bounce_number_set');
        }
    },
    117: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'lightning_imbued_skill_increased_damage');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'kah_veer_reaper_effect_cooldown_reduction_percent');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Stat, 'kah_veer_reaper_effect_walk_distance');

            addConstant(be, 35, false, EffectValueValueType.Stat, 'unlock_ancestral_legacy_max_rank');
            addConstant(be, 1, false, EffectValueValueType.Stat, 'trigger_thunderstuck_on_critical_strike');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'crit_damage_percent_mult');

        }
    },
    118: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'light_imbued_skill_increased_damage');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Stat, 'shield_globe_value_add');
            setSynergyAllowMinMax(ba, 4, false);
            setSynergyPrecision(ba, 4, 0);
            moveValue(be, 0, ba);
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Stat, 'shield_decrease_treshold');

            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'the_max_health_set');
        }
    },
}