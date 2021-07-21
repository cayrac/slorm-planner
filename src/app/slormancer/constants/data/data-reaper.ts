import { DataReaper } from '../../model/data/data-reaper';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';
import { ReaperEffect } from '../../model/reaper-effect';
import { valueOrNull } from '../../util/utils';

function overrideValueTypeAndStat(effect: ReaperEffect | null, index: number, valueType: EffectValueValueType, stat: string | null = null) {

    const value = effect !== null ? valueOrNull(effect.values[index]) : null

    if (value !== null) {
        value.valueType = valueType;
        value.stat = stat;
    } else {
        throw new Error('failed to override effect value at index ' + index + ' with : ' + valueType + ' / ' + stat);
    }
}

export const DATA_REAPER: { [key: number]: DataReaper } = {
    0: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'min_basic_damage_add');
        }
    },
    1: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'life_heal_on_breach_closed');
        }
    },
    2: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Flat, 'adam_nostrus_reaper_buff_attack_speed');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Duration, 'adam_nostrus_reaper_buff_duration');
            overrideValueTypeAndStat(ba, 2, EffectValueValueType.Duration, 'adam_nostrus_reaper_buff_duration_per_monster');
        }
    },
    3: {
        override: (ba, be, ma) => {
            overrideValueTypeAndStat(ba, 0, EffectValueValueType.Stat, 'xp_find_percent');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'bow_trainee_effect_chance');
            overrideValueTypeAndStat(ba, 1, EffectValueValueType.Flat, 'bow_trainee_effect_damages');
        }
    }
}