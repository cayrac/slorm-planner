import { DataClassMechanic } from '../../../model/content/data/data-class-mechanic';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../../model/content/enum/hero-class';
import { SkillGenre } from '../../../model/content/enum/skill-genre';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import {
    ARCANE_BOND_DAMAGE_FROM_MANA_SPENT,
    ARCANE_CLONE_ATTACK_SPEED_REDUCTION,
    ASTRAL_METEOR_AOE,
    ASTRAL_METEOR_DAMAGE_PERCENT,
    ASTRAL_RETRIBUTION_DAMAGE_PERCENT,
    POISON_DAMAGE_PERCENT,
    POISON_DURATION,
    RAVENOUS_DAGGER_DAMAGE_PERCENT,
    TRAP_AOE,
    TRAP_DAMAGE_PERCENT,
    TRAP_STUN_DURATION,
} from '../../common';

export const DATA_CLASS_MECHANIC: GameHeroesData<{ [key: number]:  DataClassMechanic }> = {
    [HeroClass.Warrior]: {
        216: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_damage_percent', 'percent', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_max_stacks', 'stacks', EffectValueValueType.Stat),
            ]
        },
        217: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'astral_retribution_damage', 'weapon_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(ASTRAL_RETRIBUTION_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'astral_meteor_damage', 'skill_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(ASTRAL_METEOR_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(ASTRAL_METEOR_AOE, false, 'astral_meteor_aoe', EffectValueValueType.AreaOfEffect),
            ]
        },
        218: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'block_damage_reduction', 'percent', EffectValueValueType.Stat),
            ]
        }
    },
    [HeroClass.Huntress]: {
        209: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'ravenous_dagger_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(RAVENOUS_DAGGER_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.AreaOfEffect ]
        },
        210: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'trap_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(TRAP_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(TRAP_AOE, false, 'trap_aoe', EffectValueValueType.AreaOfEffect),
                effectValueConstant(TRAP_STUN_DURATION, false, 'trap_stun_duration', EffectValueValueType.Duration),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'trap_arm_time', 'arm_time', EffectValueValueType.Stat, undefined, 3),
            ],
            genres: [ SkillGenre.AreaOfEffect ],
            templateOverride: template => template.replace('£', '$')
        },
        211: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'poison_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(POISON_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(POISON_DURATION, false, 'duration', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.DamageOverTime ]
        }
    },
    [HeroClass.Mage]: {
        214: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'max_emblems', 'max', EffectValueValueType.Stat, undefined, 3),
            ],
            templateOverride: template => template.replace('¥', '$')
        },
        215: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'time_lock_duration', 'duration', EffectValueValueType.Stat, undefined, 3),
            ]
        },
        216: {
            values: [
                effectValueConstant(ARCANE_BOND_DAMAGE_FROM_MANA_SPENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'arcane_bond_duration', 'duration', EffectValueValueType.Stat, undefined, 3),
            ]
        },
        217: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'remnant_decreased_damage', 'garbage_stat', EffectValueValueType.Stat, undefined, 3),
            ]
        },
        218: {
            values: [
                effectValueConstant(ARCANE_CLONE_ATTACK_SPEED_REDUCTION, false, 'garbage_stat', EffectValueValueType.Stat),
            ]
            
        }
    },
}