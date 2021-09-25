import { DataReaper } from '../../../model/content/data/data-reaper';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { ReaperEffect } from '../../../model/content/reaper-effect';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable, valueOrNull } from '../../../util/utils';

function overrideValueTypeAndStat(effect: ReaperEffect | null, index: number, valueType: EffectValueValueType, stat: string | null = null) {

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

function addConstant(effect: ReaperEffect | null, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
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
        throw new Error('failed to move effect at index ' + index);
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
        throw new Error('failed to move effect at index ' + index);
    }
}

export const DATA_REAPER: { [key: number]: DataReaper } = {
    1: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'health_restored_on_breach_close');
        }
    },
    2: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'adam_blessing_buff_cooldown_reduction_global_mult');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Duration, 'adam_blessing_buff_duration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'adam_blessing_buff_duration_per_monster');
        }
    },
    3: {
        override: (ba, be, ma) => {
            synergyMultiply100(ba, 1);
            synergyMultiply100(ba, 2);
            synergyMultiply100(be, 2);
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'trainee_reaper_effect_chance');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'trainee_reaper_effect_additional_damage');
            overrideSynergySource(ba, 2, 'xp_find');
        }
    },
    6: {
        override: (ba, be, ma) => {
            moveValue(ba, 3, be);
            synergyMultiply100(be, 1);
            addConstant(ba, 1, false, EffectValueValueType.Flat, 'skill_damage_lucky');
            addConstant(ma, 1, false, EffectValueValueType.Flat, 'cannot_imbue_skills');
        }
    },
    40: {
        override: (ba, be, ma, reaperId) => {
            // peut être mal compris comment parser les stats ?
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'thornbite_reaper_buff_idle_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'thorns_global_mult');

            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Flat, 'thornbite_reaper_buff_cooldown');
            overrideValueTypeAndStat(ba, 6, EffectValueValueType.Flat, 'idle_shield');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Duration, 'thornbite_reaper_benediction_buff_idle_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'idle_thorn_crit_chance_global_mult');
            overrideValueTypeAndStat(be, 2, EffectValueValueType.Stat, 'thorn_crit_chance_percent');
            synergyMultiply100(be, 2);
            overrideSynergySource(be, 2, 'critical_chance');

            addConstant(ma, 1, false, EffectValueValueType.Flat, 'non_thorn_cannot_crit');

            if (reaperId === 41) {
                console.log('reaper copy synergy : ', ba);
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
            changeValue(ba, 6, 8);
            changeValue(be, 1, 15);

            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'ferocious_affinity_reaper_afflict_chance');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'ferocious_affinity_reaper_afflict_duration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Flat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 6, EffectValueValueType.Stat, 'min_basic_damage_add');
            overrideValueTypeAndStat(ba, 7, EffectValueValueType.Damage, 'elemental_damage');
            
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'garbage_stat');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'min_elemental_damage_add');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Flat, 'mana_consumed_percent_on_skill_cast');
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
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'projectile_weapon_damage_mult');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'projectile_armor_penetration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'projectile_elemental_penetration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'idle_duration');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'idle_additional_projectile_add');
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Flat, 'idle_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Flat, 'idle_additional_projectile_global_mult');
            addConstant(ma, -100, true, EffectValueValueType.Stat, 'not_idle_additional_projectile_global_mult');

            
        }
    },
    61: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'primary_secondary_skill_additional_damages');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'no_gold_armor_buff_increased_damage_taken_mult');
        }
    },
    62: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'garbage_stat');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'thorns_percent');
            synergyMultiply100(ba, 1);
        }
    },
    65: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'vindictive_slam_reaper_effect_chance');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Damage, 'vindictive_slam_reaper_effect_elemental_damage');
            addConstant(ba, 2, false, EffectValueValueType.AreaOfEffect, 'vindictive_slam_reaper_effect_radius');
            overrideValueTypeAndStat(be, 0, EffectValueValueType.Duration, 'vindictive_slam_reaper_benediction_effect_duration');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Damage, 'vindictive_slam_reaper_benediction_effect_damages');
            addConstant(be, 1, false, EffectValueValueType.Stat, 'reaper_added_to_elements');
            addConstant(ma, -100, false, EffectValueValueType.Stat, 'basic_damage_global_mult');
        }
    },
    66: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'vindictive_slam_reaper_effect_radius_mult');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'vindictive_slam_reaper_effect_elemental_damage_mult');
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
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'mana_skill_as_life_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'mana_restored_percent_on_hit_taken');
            moveValue(ba, 3, be);
            moveValue(ba, 3, be);
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Stat, 'primary_skill_additional_damages');
            overrideValueTypeAndStat(be, 2, EffectValueValueType.Stat, 'the_max_health_add');
        }
    },
    74: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'mana_regen_add');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'mana_cost_percent_as_additional_damages');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'min_basic_damage_add');

            addConstant(be, 1, false, EffectValueValueType.AreaOfEffect, 'manabender_benediction_effect_radius');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'life_percent_removed_on_cast');
        }
    },
    75: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'nimble_warrior_reaper_effect_crit_damage_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'nimble_warrior_reaper_effect_brut_damage_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'nimble_warrior_reaper_effect_crit_chance_percent');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Flat, 'nimble_warrior_reaper_effect_brut_chance_percent');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'nimble_warrior_reaper_effect_increased_primary_damage');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Duration, 'nimble_warrior_reaper_effect_disable_duration');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Flat, 'nimble_warrior_reaper_benediction_effect_percent');
            overrideValueTypeAndStat(be, 1, EffectValueValueType.Duration, 'nimble_warrior_reaper_benediction_disable_duration');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Duration, 'nimble_warrior_reaper_malediction_disable_duration');

        }
    },
    78: {
        override: (ba, be, ma, reaperId) => {
            if (reaperId === 78 || reaperId === 79) {
                negateValueBaseAndUpgrade(ba, 0);
                negateValueBaseAndUpgrade(ba, 1);
            }
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'the_speed_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'elemental_damage_global_mult');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Flat, 'sleepy_butterfly_reaper_effect_damages_max_life_percent');
            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'min_cooldown_time');

        }
    },
    79: {
        override: (ba, be, ma, reaperId) => {
            if (reaperId === 79) {
                negateValueBaseAndUpgrade(ba, 0);
            }
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'chrysalis_reaper_effect_elemental_damage_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.AreaOfEffect, 'chrysalis_reaper_effect_radius');
        }
    },
    80: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Damage, 'sleepy_butterfly_reaper_effect_elemental_damage');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'sleepy_butterfly_reaper_effect_duration');
        }
    },
    81: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'elemental_damage_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'ancestral_legacy_reaper_crystal_count');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Damage, 'ancestral_legacy_reaper_crystal_damages');

            if (reaperId === 82 && ba !== null) {
                changeValue(ba, 1, 2);
            } else if (reaperId === 83 && ba !== null) {
                changeValue(ba, 1, 3);
            }

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Flat, 'ancestral_legacy_reaper_crystal_projectiles_count');
        }
    },
    82: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'ancestral_legacy_reaper_buff_legacy_brut_chance');
        }
    },
    83: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Duration, 'ancestral_legacy_reaper_buff_fervor_duration');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'ancestral_legacy_reaper_buff_fervor_elemental_damages');
        }
    },
    98: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'overdrive_bounce_number_add');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'overdrive_chance_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'overdrive_chance_percent_on_critical_strike');

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'overdrive_damage_percent');
        }
    },
    111: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'essence_find_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'essence_find_global_mult');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'slormbane_reaper_addition_damage_slorm_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Damage, 'slormbane_reaper_additional_damage');
        }
    },
    112: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'gold_find_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'gold_find_global_mult');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'goldscourge_reaper_addition_damage_gold_duration');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Damage, 'goldscourge_reaper_additional_damage');
            moveValue(ba, 4, be);

            overrideValueTypeAndStat(be, 0, EffectValueValueType.Stat, 'goldscourge_reaper_golden_overdrive_damage_percent');
        }
    },
    117: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'lightning_resistance_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'elemental_damage_percent');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Stat, 'the_speed_percent');
            overrideValueTypeAndStat(ba, 3, EffectValueValueType.Stat, 'kah_veer_reaper_lightning_imbued_increased_damage');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'kah_veer_reaper_effect_cooldown_reduction_percent');
            overrideValueTypeAndStat(ba, 5, EffectValueValueType.Flat, 'kah_veer_reaper_effect_walk_distance');

            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'crit_damage_percent_mult');
        }
    },
    118: {
        override: (ba, be, ma, reaperId) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'light_resistance_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Stat, 'shield_globe_value');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Flat, 'rising_sun_reaper_light_imbued_increased_damage');
            overrideValueTypeAndStat(ba, 4, EffectValueValueType.Flat, 'shield_globe_increased_value');
            moveValue(be, 0, ba);

            overrideValueTypeAndStat(ma, 0, EffectValueValueType.Stat, 'the_max_health_forced');
        }
    },
}